import random
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.quotation import Quotation
from app.schemas.quotation import QuotationCreate, QuotationOut
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("", response_model=List[QuotationOut])
def list_quotations(lead_id: int = None, db: Session = Depends(get_db), _=Depends(get_current_user)):
    q = db.query(Quotation)
    if lead_id:
        q = q.filter(Quotation.lead_id == lead_id)
    return q.order_by(Quotation.id.desc()).all()


@router.post("", response_model=QuotationOut)
def create_quotation(payload: QuotationCreate, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    quote = Quotation(**payload.model_dump(), created_by_id=current_user.id,
                       quote_number=f"QT-{random.randint(100000, 999999)}", status="draft")
    db.add(quote)
    db.commit()
    db.refresh(quote)
    return quote


@router.get("/{quote_id}", response_model=QuotationOut)
def get_quotation(quote_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    quote = db.query(Quotation).get(quote_id)
    if not quote:
        raise HTTPException(status_code=404, detail="Quotation not found")
    return quote


@router.put("/{quote_id}/status")
def update_quotation_status(quote_id: int, status_value: str, db: Session = Depends(get_db),
                             _=Depends(get_current_user)):
    quote = db.query(Quotation).get(quote_id)
    if not quote:
        raise HTTPException(status_code=404, detail="Quotation not found")
    quote.status = status_value
    db.commit()
    return {"message": "Status updated", "status": status_value}

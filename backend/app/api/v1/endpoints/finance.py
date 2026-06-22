from typing import List
from decimal import Decimal
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.finance import LoanApplication, InsurancePolicy
from app.schemas.finance import (
    LoanCreate, LoanUpdate, LoanOut, InsuranceCreate, InsuranceOut,
    EMICalcRequest, EMICalcResponse
)
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/emi-calculator", response_model=EMICalcResponse)
def calculate_emi(payload: EMICalcRequest):
    p = float(payload.principal)
    r = float(payload.annual_rate) / 12 / 100
    n = payload.tenure_months
    if r == 0:
        emi = p / n
    else:
        emi = (p * r * (1 + r) ** n) / (((1 + r) ** n) - 1)
    total_payment = emi * n
    total_interest = total_payment - p
    return EMICalcResponse(
        emi=round(Decimal(emi), 2),
        total_payment=round(Decimal(total_payment), 2),
        total_interest=round(Decimal(total_interest), 2),
    )


@router.get("/loans", response_model=List[LoanOut])
def list_loans(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(LoanApplication).order_by(LoanApplication.id.desc()).all()


@router.post("/loans", response_model=LoanOut)
def create_loan(payload: LoanCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    loan = LoanApplication(**payload.model_dump(), applied_at=datetime.utcnow())
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan


@router.put("/loans/{loan_id}", response_model=LoanOut)
def update_loan(loan_id: int, payload: LoanUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    loan = db.query(LoanApplication).get(loan_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(loan, k, v)
    if payload.status and payload.status.value == "approved":
        loan.approved_at = datetime.utcnow()
    db.commit()
    db.refresh(loan)
    return loan


@router.get("/insurance", response_model=List[InsuranceOut])
def list_insurance(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(InsurancePolicy).order_by(InsurancePolicy.id.desc()).all()


@router.post("/insurance", response_model=InsuranceOut)
def create_insurance(payload: InsuranceCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    policy = InsurancePolicy(**payload.model_dump())
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy

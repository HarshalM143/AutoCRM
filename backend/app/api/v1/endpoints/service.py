import random
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.service import ServiceJob, SparePart
from app.schemas.service import ServiceJobCreate, ServiceJobUpdate, ServiceJobOut, SparePartOut, SparePartCreate
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/jobs", response_model=List[ServiceJobOut])
def list_service_jobs(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(ServiceJob).order_by(ServiceJob.id.desc()).all()


@router.post("/jobs", response_model=ServiceJobOut)
def create_service_job(payload: ServiceJobCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    job = ServiceJob(**payload.model_dump(), job_card_number=f"JC-{random.randint(100000, 999999)}")
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.put("/jobs/{job_id}", response_model=ServiceJobOut)
def update_service_job(job_id: int, payload: ServiceJobUpdate, db: Session = Depends(get_db),
                        _=Depends(get_current_user)):
    job = db.query(ServiceJob).get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Service job not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(job, k, v)
    db.commit()
    db.refresh(job)
    return job


@router.get("/parts", response_model=List[SparePartOut])
def list_spare_parts(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(SparePart).order_by(SparePart.id.desc()).all()


@router.post("/parts", response_model=SparePartOut)
def create_spare_part(payload: SparePartCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    part = SparePart(**payload.model_dump())
    db.add(part)
    db.commit()
    db.refresh(part)
    return part


@router.get("/parts-report")
def parts_report(db: Session = Depends(get_db), _=Depends(get_current_user)):
    parts = db.query(SparePart).all()
    low_stock = [p for p in parts if p.stock_quantity <= p.low_stock_threshold]
    inventory_value = sum(float(p.unit_price or 0) * p.stock_quantity for p in parts)
    fast_moving = sorted(parts, key=lambda p: p.stock_quantity)[:5]
    return {
        "low_stock_parts": [{"id": p.id, "name": p.name, "stock_quantity": p.stock_quantity} for p in low_stock],
        "inventory_value": inventory_value,
        "fast_moving_parts": [{"id": p.id, "name": p.name} for p in fast_moving],
    }

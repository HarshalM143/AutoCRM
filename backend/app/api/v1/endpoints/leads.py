import random
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.lead import Lead, LeadActivity
from app.models.user import User
from app.schemas.lead import LeadCreate, LeadUpdate, LeadOut, LeadActivityCreate, LeadActivityOut
from app.api.deps import get_current_user

router = APIRouter()


def calculate_ai_score(lead: Lead) -> tuple[int, int]:
    """Lightweight heuristic 'AI' lead scoring (deterministic placeholder for an ML model)."""
    base = 40
    source_weights = {"referral": 25, "walk_in": 20, "website": 10, "event": 15, "call_center": 8, "social_media": 5, "partner": 12}
    base += source_weights.get(lead.source.value if hasattr(lead.source, "value") else lead.source, 5)
    status_weights = {"new": 0, "contacted": 5, "qualified": 15, "test_drive_scheduled": 25,
                       "negotiation": 35, "booking": 45, "delivered": 50, "closed": 0, "lost": -40}
    base += status_weights.get(lead.status.value if hasattr(lead.status, "value") else lead.status, 0)
    score = max(0, min(100, base + random.randint(-5, 5)))
    probability = max(0, min(100, int(score * 0.9)))
    return score, probability


@router.get("", response_model=List[LeadOut])
def list_leads(status: Optional[str] = None, branch_id: Optional[int] = None,
               assigned_to_id: Optional[int] = None, skip: int = 0, limit: int = 100,
               db: Session = Depends(get_db), _=Depends(get_current_user)):
    q = db.query(Lead)
    if status:
        q = q.filter(Lead.status == status)
    if branch_id:
        q = q.filter(Lead.branch_id == branch_id)
    if assigned_to_id:
        q = q.filter(Lead.assigned_to_id == assigned_to_id)
    return q.order_by(Lead.id.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=LeadOut)
def create_lead(payload: LeadCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lead = Lead(**payload.model_dump())
    score, prob = calculate_ai_score(lead)
    lead.score = score
    lead.purchase_probability = prob
    db.add(lead)
    db.commit()
    db.refresh(lead)
    db.add(LeadActivity(lead_id=lead.id, user_id=current_user.id, activity_type="note",
                         description="Lead created"))
    db.commit()
    return lead


@router.get("/{lead_id}", response_model=LeadOut)
def get_lead(lead_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    lead = db.query(Lead).get(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.put("/{lead_id}", response_model=LeadOut)
def update_lead(lead_id: int, payload: LeadUpdate, db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_user)):
    lead = db.query(Lead).get(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    old_status = lead.status
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(lead, k, v)
    if payload.status and payload.status != old_status:
        db.add(LeadActivity(lead_id=lead.id, user_id=current_user.id, activity_type="status_change",
                             description=f"Status changed: {old_status.value} -> {payload.status.value}"))
        score, prob = calculate_ai_score(lead)
        lead.score, lead.purchase_probability = score, prob
    db.commit()
    db.refresh(lead)
    return lead


@router.delete("/{lead_id}")
def delete_lead(lead_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    lead = db.query(Lead).get(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    db.delete(lead)
    db.commit()
    return {"message": "Lead deleted"}


@router.post("/{lead_id}/activities", response_model=LeadActivityOut)
def add_activity(lead_id: int, payload: LeadActivityCreate, db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_user)):
    lead = db.query(Lead).get(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    activity = LeadActivity(lead_id=lead_id, user_id=current_user.id, **payload.model_dump())
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@router.get("/{lead_id}/activities", response_model=List[LeadActivityOut])
def list_activities(lead_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(LeadActivity).filter(LeadActivity.lead_id == lead_id).order_by(LeadActivity.id.desc()).all()

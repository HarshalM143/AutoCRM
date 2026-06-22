from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import Branch
from app.schemas.user import BranchCreate, BranchOut
from app.api.deps import get_current_user, require_roles
from app.models.enums import UserRole

router = APIRouter()


@router.get("", response_model=List[BranchOut])
def list_branches(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Branch).all()


@router.post("", response_model=BranchOut)
def create_branch(payload: BranchCreate, db: Session = Depends(get_db),
                   _=Depends(require_roles(UserRole.SUPER_ADMIN))):
    branch = Branch(**payload.model_dump())
    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch


@router.get("/{branch_id}/report")
def branch_report(branch_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    from app.models.lead import Lead
    from app.models.vehicle import Vehicle
    from app.models.booking import Booking
    leads = db.query(Lead).filter(Lead.branch_id == branch_id).count()
    vehicles = db.query(Vehicle).filter(Vehicle.branch_id == branch_id).count()
    bookings = db.query(Booking).join(Vehicle).filter(Vehicle.branch_id == branch_id).count()
    return {"branch_id": branch_id, "total_leads": leads, "total_vehicles": vehicles, "total_bookings": bookings}

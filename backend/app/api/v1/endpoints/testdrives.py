from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.testdrive import TestDrive
from app.schemas.testdrive import TestDriveCreate, TestDriveUpdate, TestDriveOut
from app.api.deps import get_current_user

router = APIRouter()


@router.get("", response_model=List[TestDriveOut])
def list_test_drives(status: Optional[str] = None, db: Session = Depends(get_db), _=Depends(get_current_user)):
    q = db.query(TestDrive)
    if status:
        q = q.filter(TestDrive.status == status)
    return q.order_by(TestDrive.scheduled_at.desc()).all()


@router.post("", response_model=TestDriveOut)
def create_test_drive(payload: TestDriveCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    td = TestDrive(**payload.model_dump())
    db.add(td)
    db.commit()
    db.refresh(td)
    return td


@router.put("/{td_id}", response_model=TestDriveOut)
def update_test_drive(td_id: int, payload: TestDriveUpdate, db: Session = Depends(get_db),
                       _=Depends(get_current_user)):
    td = db.query(TestDrive).get(td_id)
    if not td:
        raise HTTPException(status_code=404, detail="Test drive not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(td, k, v)
    db.commit()
    db.refresh(td)
    return td

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.enums import TestDriveStatus


class TestDriveBase(BaseModel):
    customer_id: int
    vehicle_id: int
    lead_id: Optional[int] = None
    assigned_executive_id: Optional[int] = None
    scheduled_at: datetime
    route: Optional[str] = None


class TestDriveCreate(TestDriveBase):
    pass


class TestDriveUpdate(BaseModel):
    status: Optional[TestDriveStatus] = None
    feedback: Optional[str] = None
    rating: Optional[int] = None
    scheduled_at: Optional[datetime] = None


class TestDriveOut(TestDriveBase):
    id: int
    status: TestDriveStatus
    feedback: Optional[str] = None
    rating: Optional[int] = None
    model_config = {"from_attributes": True}

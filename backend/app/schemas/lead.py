from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.enums import LeadStatus, LeadSource


class LeadBase(BaseModel):
    customer_id: int
    branch_id: Optional[int] = None
    assigned_to_id: Optional[int] = None
    interested_vehicle_id: Optional[int] = None
    source: LeadSource = LeadSource.WEBSITE
    notes: Optional[str] = None
    next_follow_up: Optional[datetime] = None


class LeadCreate(LeadBase):
    pass


class LeadUpdate(BaseModel):
    status: Optional[LeadStatus] = None
    assigned_to_id: Optional[int] = None
    interested_vehicle_id: Optional[int] = None
    notes: Optional[str] = None
    next_follow_up: Optional[datetime] = None
    score: Optional[int] = None
    purchase_probability: Optional[int] = None


class LeadActivityCreate(BaseModel):
    activity_type: str
    description: str


class LeadActivityOut(BaseModel):
    id: int
    activity_type: str
    description: Optional[str] = None
    created_at: datetime
    user_id: Optional[int] = None
    model_config = {"from_attributes": True}


class LeadOut(BaseModel):
    id: int
    customer_id: int
    branch_id: Optional[int] = None
    assigned_to_id: Optional[int] = None
    interested_vehicle_id: Optional[int] = None
    status: LeadStatus
    source: LeadSource
    score: int
    purchase_probability: int
    next_follow_up: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    model_config = {"from_attributes": True}

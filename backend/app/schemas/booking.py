from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime
from app.models.enums import BookingStatus


class BookingCreate(BaseModel):
    customer_id: int
    vehicle_id: int
    lead_id: Optional[int] = None
    sales_executive_id: Optional[int] = None
    booking_amount: Decimal
    total_amount: Decimal


class BookingUpdate(BaseModel):
    status: Optional[BookingStatus] = None
    amount_paid: Optional[Decimal] = None
    delivery_scheduled_at: Optional[datetime] = None
    delivery_completed_at: Optional[datetime] = None
    handover_checklist: Optional[str] = None
    notes: Optional[str] = None


class BookingOut(BaseModel):
    id: int
    booking_number: Optional[str] = None
    customer_id: int
    vehicle_id: int
    status: BookingStatus
    booking_amount: Decimal
    total_amount: Decimal
    amount_paid: Decimal
    delivery_scheduled_at: Optional[datetime] = None
    delivery_completed_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

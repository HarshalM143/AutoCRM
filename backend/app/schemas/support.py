from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.enums import TicketStatus, TicketPriority


class TicketCreate(BaseModel):
    customer_id: int
    subject: str
    description: Optional[str] = None
    category: Optional[str] = None
    priority: TicketPriority = TicketPriority.MEDIUM


class TicketUpdate(BaseModel):
    status: Optional[TicketStatus] = None
    assigned_to_id: Optional[int] = None
    priority: Optional[TicketPriority] = None
    resolution_notes: Optional[str] = None


class TicketOut(BaseModel):
    id: int
    ticket_number: Optional[str] = None
    customer_id: int
    subject: str
    category: Optional[str] = None
    priority: TicketPriority
    status: TicketStatus
    assigned_to_id: Optional[int] = None
    sla_due_at: Optional[datetime] = None
    created_at: datetime
    model_config = {"from_attributes": True}

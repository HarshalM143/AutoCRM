import random
from typing import List
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.support import Ticket
from app.models.enums import TicketPriority
from app.schemas.support import TicketCreate, TicketUpdate, TicketOut
from app.api.deps import get_current_user

router = APIRouter()

SLA_HOURS = {TicketPriority.CRITICAL: 4, TicketPriority.HIGH: 12, TicketPriority.MEDIUM: 24, TicketPriority.LOW: 72}


@router.get("", response_model=List[TicketOut])
def list_tickets(status: str = None, db: Session = Depends(get_db), _=Depends(get_current_user)):
    q = db.query(Ticket)
    if status:
        q = q.filter(Ticket.status == status)
    return q.order_by(Ticket.id.desc()).all()


@router.post("", response_model=TicketOut)
def create_ticket(payload: TicketCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    sla_due = datetime.utcnow() + timedelta(hours=SLA_HOURS.get(payload.priority, 24))
    ticket = Ticket(**payload.model_dump(), ticket_number=f"TKT-{random.randint(100000, 999999)}",
                     sla_due_at=sla_due)
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


@router.put("/{ticket_id}", response_model=TicketOut)
def update_ticket(ticket_id: int, payload: TicketUpdate, db: Session = Depends(get_db),
                   _=Depends(get_current_user)):
    ticket = db.query(Ticket).get(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(ticket, k, v)
    if payload.status and payload.status.value in ("resolved", "closed"):
        ticket.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(ticket)
    return ticket

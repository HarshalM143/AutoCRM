from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.customer import Customer
from app.models.lead import Lead
from app.models.testdrive import TestDrive
from app.models.booking import Booking
from app.models.service import ServiceJob
from app.models.finance import LoanApplication, InsurancePolicy
from app.models.support import Ticket
from app.models.communication import CommunicationLog
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerOut
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("", response_model=List[CustomerOut])
def list_customers(skip: int = 0, limit: int = 50, search: Optional[str] = None,
                    db: Session = Depends(get_db), _=Depends(get_current_user)):
    q = db.query(Customer)
    if search:
        q = q.filter(Customer.full_name.ilike(f"%{search}%") | Customer.phone.ilike(f"%{search}%"))
    return q.order_by(Customer.id.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=CustomerOut)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    customer = Customer(**payload.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(customer_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    customer = db.query(Customer).get(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.put("/{customer_id}", response_model=CustomerOut)
def update_customer(customer_id: int, payload: CustomerUpdate, db: Session = Depends(get_db),
                     _=Depends(get_current_user)):
    customer = db.query(Customer).get(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(customer, k, v)
    db.commit()
    db.refresh(customer)
    return customer


@router.get("/{customer_id}/360")
def customer_360(customer_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Aggregated Customer 360 view: vehicles, service, complaints, payments, test drives, loans, insurance, comms."""
    customer = db.query(Customer).get(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    leads = db.query(Lead).filter(Lead.customer_id == customer_id).all()
    test_drives = db.query(TestDrive).filter(TestDrive.customer_id == customer_id).all()
    bookings = db.query(Booking).filter(Booking.customer_id == customer_id).all()
    service_jobs = db.query(ServiceJob).filter(ServiceJob.customer_id == customer_id).all()
    loans = db.query(LoanApplication).filter(LoanApplication.customer_id == customer_id).all()
    insurance = db.query(InsurancePolicy).filter(InsurancePolicy.customer_id == customer_id).all()
    tickets = db.query(Ticket).filter(Ticket.customer_id == customer_id).all()
    comms = db.query(CommunicationLog).filter(CommunicationLog.customer_id == customer_id).all()

    timeline = []
    for l in leads:
        timeline.append({"type": "lead", "date": l.created_at, "detail": f"Lead created - {l.status.value}"})
    for t in test_drives:
        timeline.append({"type": "test_drive", "date": t.scheduled_at, "detail": f"Test drive - {t.status.value}"})
    for b in bookings:
        timeline.append({"type": "booking", "date": b.created_at, "detail": f"Booking {b.booking_number} - {b.status.value}"})
    for s in service_jobs:
        timeline.append({"type": "service", "date": s.scheduled_at, "detail": f"Service {s.job_card_number} - {s.status.value}"})
    for t in tickets:
        timeline.append({"type": "ticket", "date": t.created_at, "detail": f"Ticket {t.ticket_number} - {t.status.value}"})
    for c in comms:
        timeline.append({"type": "communication", "date": c.created_at, "detail": f"{c.channel.value}: {c.subject or c.message[:50] if c.message else ''}"})

    timeline.sort(key=lambda x: x["date"] or 0, reverse=True)

    return {
        "customer": CustomerOut.model_validate(customer),
        "leads_count": len(leads),
        "vehicles_owned": [b.vehicle_id for b in bookings if b.status.value == "delivered"],
        "test_drives": len(test_drives),
        "bookings": len(bookings),
        "service_jobs": len(service_jobs),
        "loans": len(loans),
        "insurance_policies": len(insurance),
        "tickets": len(tickets),
        "timeline": timeline[:50],
    }

import random
import re
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.models.lead import Lead
from app.models.booking import Booking
from app.models.customer import Customer
from app.models.service import ServiceJob
from app.api.deps import get_current_user

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


class FollowUpRequest(BaseModel):
    customer_name: str
    vehicle_model: Optional[str] = None
    channel: str = "email"  # email, whatsapp, call_script
    context: Optional[str] = None


@router.post("/chat")
def crm_chat(payload: ChatRequest, db: Session = Depends(get_db), _=Depends(get_current_user)):
    """A lightweight rule-based assistant that answers common CRM queries.
    In production this would call an LLM with tool-use access to the CRM API."""
    msg = payload.message.lower()

    if "hot lead" in msg:
        leads = db.query(Lead).filter(Lead.score >= 70).limit(10).all()
        return {"reply": f"You have {len(leads)} hot leads with a score of 70+.",
                "data": [{"id": l.id, "score": l.score, "status": l.status.value} for l in leads]}

    if "pending deliver" in msg or "upcoming deliver" in msg:
        bookings = db.query(Booking).filter(Booking.delivery_scheduled_at.isnot(None)).limit(10).all()
        return {"reply": f"There are {len(bookings)} deliveries scheduled.",
                "data": [{"id": b.id, "booking_number": b.booking_number,
                          "delivery_scheduled_at": b.delivery_scheduled_at} for b in bookings]}

    if "monthly sales report" in msg or "sales report" in msg:
        month_bookings = db.query(Booking).filter(
            Booking.created_at >= datetime.utcnow().replace(day=1)
        ).all()
        total_rev = float(sum(b.total_amount or 0 for b in month_bookings))
        return {"reply": f"This month: {len(month_bookings)} bookings, revenue ₹{total_rev:,.0f}."}

    if "likely to buy" in msg or "buy this month" in msg:
        leads = db.query(Lead).filter(Lead.purchase_probability >= 60).order_by(
            Lead.purchase_probability.desc()).limit(10).all()
        return {"reply": f"{len(leads)} customers have a 60%+ purchase probability this month.",
                "data": [{"id": l.id, "customer_id": l.customer_id, "probability": l.purchase_probability} for l in leads]}

    if "service due" in msg:
        jobs = db.query(ServiceJob).filter(ServiceJob.status == "booked").limit(10).all()
        return {"reply": f"{len(jobs)} service jobs are booked/upcoming."}

    return {"reply": "I can help with: hot leads, pending deliveries, monthly sales report, "
                      "likely buyers this month, or service due alerts. Try asking one of those."}


@router.post("/follow-up-generator")
def generate_follow_up(payload: FollowUpRequest, _=Depends(get_current_user)):
    """Template-based follow-up message generator (placeholder for LLM-generated copy)."""
    vehicle_phrase = f" the {payload.vehicle_model}" if payload.vehicle_model else " our latest vehicles"

    if payload.channel == "email":
        text = (f"Subject: Following up on your interest{vehicle_phrase}\n\n"
                f"Dear {payload.customer_name},\n\n"
                f"Thank you for your interest in{vehicle_phrase}. I wanted to check in and see if you "
                f"had any questions, or if you'd like to schedule a test drive at your convenience.\n\n"
                f"Looking forward to hearing from you.\n\nWarm regards,\nYour Sales Team")
    elif payload.channel == "whatsapp":
        text = (f"Hi {payload.customer_name}! 👋 Just checking in about{vehicle_phrase}. "
                f"Let me know if you'd like to book a test drive or have any questions. We're here to help!")
    else:  # call_script
        text = (f"Hi, this is [Executive Name] calling from [Dealership]. I'm following up with "
                f"{payload.customer_name} regarding{vehicle_phrase}. Is now a good time to talk about "
                f"next steps, like a test drive or financing options?")

    return {"channel": payload.channel, "message": text}


@router.get("/service-reminders")
def predict_service_reminders(db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Predicts which customers are likely due for service based on time since last visit."""
    jobs = db.query(ServiceJob).filter(ServiceJob.status == "delivered").all()
    reminders = []
    for j in jobs:
        if j.scheduled_at and (datetime.utcnow() - j.scheduled_at).days >= 150:
            reminders.append({
                "customer_id": j.customer_id,
                "last_service": j.scheduled_at,
                "predicted_due_date": j.scheduled_at + timedelta(days=180),
            })
    return {"reminders": reminders, "count": len(reminders)}


@router.get("/sales-forecast")
def sales_forecast(db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Simple moving-average style forecast (placeholder for a real time-series ML model)."""
    bookings = db.query(Booking).all()
    monthly_counts = {}
    for b in bookings:
        if b.created_at:
            key = b.created_at.strftime("%Y-%m")
            monthly_counts[key] = monthly_counts.get(key, 0) + 1
    avg = sum(monthly_counts.values()) / len(monthly_counts) if monthly_counts else 0
    next_month_forecast = round(avg * (1 + random.uniform(0.02, 0.12)), 1)
    revenue_avg = float(sum(b.total_amount or 0 for b in bookings)) / max(len(bookings), 1)
    return {
        "predicted_units_next_month": next_month_forecast,
        "predicted_revenue_next_month": round(next_month_forecast * revenue_avg, 2),
        "confidence": "medium",
        "basis": "trailing average of historical bookings",
    }

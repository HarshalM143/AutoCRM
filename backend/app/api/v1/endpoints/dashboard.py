from datetime import datetime, timedelta
from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.models.customer import Customer
from app.models.lead import Lead
from app.models.vehicle import Vehicle
from app.models.booking import Booking
from app.models.service import ServiceJob
from app.models.user import Branch
from app.models.enums import LeadStatus, VehicleStatus
from app.api.deps import get_current_user

router = APIRouter()


@router.get("")
def get_dashboard(db: Session = Depends(get_db), _=Depends(get_current_user)):
    total_customers = db.query(Customer).count()
    total_leads = db.query(Lead).count()
    hot_leads = db.query(Lead).filter(Lead.score >= 70).count()
    vehicles_sold = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.SOLD).count()

    bookings = db.query(Booking).all()
    revenue = float(sum(b.total_amount or 0 for b in bookings))
    monthly_sales = len([b for b in bookings if b.created_at and b.created_at.month == datetime.utcnow().month])

    service_jobs = db.query(ServiceJob).all()
    service_revenue = float(sum(s.final_cost or s.estimated_cost or 0 for s in service_jobs))

    pending_follow_ups = db.query(Lead).filter(
        Lead.next_follow_up.isnot(None), Lead.next_follow_up <= datetime.utcnow() + timedelta(days=1)
    ).count()

    # Sales trend - last 6 months
    sales_trend = []
    revenue_trend = []
    for i in range(5, -1, -1):
        month_date = datetime.utcnow() - timedelta(days=30 * i)
        label = month_date.strftime("%b")
        month_bookings = [b for b in bookings if b.created_at and b.created_at.month == month_date.month]
        sales_trend.append({"label": label, "value": len(month_bookings)})
        revenue_trend.append({"label": label, "value": float(sum(b.total_amount or 0 for b in month_bookings))})

    closed_leads = db.query(Lead).filter(Lead.status == LeadStatus.DELIVERED).count()
    lead_conversion_rate = round((closed_leads / total_leads * 100), 1) if total_leads else 0.0

    vehicle_dist = defaultdict(int)
    for v in db.query(Vehicle).all():
        vehicle_dist[v.category.value] += 1
    vehicle_distribution = [{"label": k, "value": v} for k, v in vehicle_dist.items()]

    branch_perf = []
    for branch in db.query(Branch).all():
        b_bookings = [b for b in bookings if b.vehicle and b.vehicle.branch_id == branch.id]
        branch_perf.append({
            "branch_name": branch.name,
            "sales": len(b_bookings),
            "revenue": float(sum(b.total_amount or 0 for b in b_bookings)),
        })

    return {
        "kpis": {
            "total_customers": total_customers,
            "total_leads": total_leads,
            "hot_leads": hot_leads,
            "vehicles_sold": vehicles_sold,
            "revenue": revenue,
            "monthly_sales": monthly_sales,
            "service_revenue": service_revenue,
            "pending_follow_ups": pending_follow_ups,
        },
        "sales_trend": sales_trend,
        "revenue_trend": revenue_trend,
        "lead_conversion_rate": lead_conversion_rate,
        "vehicle_distribution": vehicle_distribution,
        "branch_performance": branch_perf,
    }


@router.get("/widgets")
def get_widgets(db: Session = Depends(get_db), _=Depends(get_current_user)):
    from app.models.testdrive import TestDrive
    today = datetime.utcnow().date()
    todays_appointments = db.query(TestDrive).filter(
        func.date(TestDrive.scheduled_at) == today
    ).count()
    upcoming_deliveries = db.query(Booking).filter(
        Booking.delivery_scheduled_at.isnot(None),
        Booking.delivery_scheduled_at >= datetime.utcnow()
    ).count()
    return {
        "todays_appointments": todays_appointments,
        "upcoming_deliveries": upcoming_deliveries,
        "service_due_alerts": db.query(ServiceJob).filter(ServiceJob.status == "booked").count(),
    }

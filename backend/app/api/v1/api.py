from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth, customers, leads, vehicles, testdrives, quotations,
    bookings, finance, service, support, branches, users,
    notifications, audit, dashboard, ai
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(branches.router, prefix="/branches", tags=["Branches"])
api_router.include_router(customers.router, prefix="/customers", tags=["Customers"])
api_router.include_router(leads.router, prefix="/leads", tags=["Leads"])
api_router.include_router(vehicles.router, prefix="/vehicles", tags=["Vehicles"])
api_router.include_router(testdrives.router, prefix="/test-drives", tags=["Test Drives"])
api_router.include_router(quotations.router, prefix="/quotations", tags=["Quotations"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["Bookings"])
api_router.include_router(finance.router, prefix="/finance", tags=["Finance"])
api_router.include_router(service.router, prefix="/service", tags=["Service"])
api_router.include_router(support.router, prefix="/tickets", tags=["Support"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(audit.router, prefix="/audit-logs", tags=["Audit"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI"])

from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime
from app.models.enums import ServiceStatus


class ServiceJobCreate(BaseModel):
    customer_id: int
    vehicle_id: Optional[int] = None
    service_advisor_id: Optional[int] = None
    technician_id: Optional[int] = None
    service_type: str
    description: Optional[str] = None
    scheduled_at: datetime
    estimated_cost: Optional[Decimal] = None
    odometer_reading: Optional[int] = None


class ServiceJobUpdate(BaseModel):
    status: Optional[ServiceStatus] = None
    technician_id: Optional[int] = None
    final_cost: Optional[Decimal] = None
    recommendations: Optional[str] = None


class ServiceJobOut(BaseModel):
    id: int
    job_card_number: Optional[str] = None
    customer_id: int
    vehicle_id: Optional[int] = None
    service_type: str
    status: ServiceStatus
    scheduled_at: datetime
    estimated_cost: Optional[Decimal] = None
    final_cost: Optional[Decimal] = None
    model_config = {"from_attributes": True}


class SparePartOut(BaseModel):
    id: int
    name: str
    part_number: Optional[str] = None
    category: Optional[str] = None
    vendor: Optional[str] = None
    unit_price: Optional[Decimal] = None
    stock_quantity: int
    low_stock_threshold: int
    model_config = {"from_attributes": True}


class SparePartCreate(BaseModel):
    name: str
    part_number: str
    category: Optional[str] = None
    vendor: Optional[str] = None
    unit_price: Decimal
    stock_quantity: int = 0
    low_stock_threshold: int = 10
    warehouse_location: Optional[str] = None

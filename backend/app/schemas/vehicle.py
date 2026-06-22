from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from app.models.enums import VehicleCategory, VehicleStatus


class VehicleBase(BaseModel):
    model_name: str
    variant: Optional[str] = None
    category: VehicleCategory
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    color: Optional[str] = None
    vin: Optional[str] = None
    registration_number: Optional[str] = None
    ex_showroom_price: Decimal
    on_road_price: Optional[Decimal] = None
    stock_quantity: int = 1
    low_stock_threshold: int = 3
    branch_id: Optional[int] = None
    specifications: Optional[str] = None
    image_urls: Optional[str] = None


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    status: Optional[VehicleStatus] = None
    stock_quantity: Optional[int] = None
    on_road_price: Optional[Decimal] = None
    ex_showroom_price: Optional[Decimal] = None


class VehicleOut(VehicleBase):
    id: int
    status: VehicleStatus
    model_config = {"from_attributes": True}

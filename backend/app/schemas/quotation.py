from pydantic import BaseModel
from typing import Optional
from decimal import Decimal


class QuotationCreate(BaseModel):
    lead_id: int
    vehicle_id: int
    ex_showroom_price: Decimal
    accessories_cost: Decimal = 0
    tax_amount: Decimal = 0
    discount: Decimal = 0
    on_road_price: Decimal
    emi_tenure_months: Optional[str] = None
    emi_amount: Optional[Decimal] = None


class QuotationOut(QuotationCreate):
    id: int
    quote_number: Optional[str] = None
    status: str
    model_config = {"from_attributes": True}

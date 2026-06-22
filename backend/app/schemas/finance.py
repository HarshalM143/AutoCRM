from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime
from app.models.enums import LoanStatus, InsuranceStatus


class LoanCreate(BaseModel):
    customer_id: int
    booking_id: Optional[int] = None
    bank_name: str
    loan_amount: Decimal
    interest_rate: Optional[Decimal] = None
    tenure_months: Optional[int] = None


class LoanUpdate(BaseModel):
    status: Optional[LoanStatus] = None
    remarks: Optional[str] = None
    emi_amount: Optional[Decimal] = None


class LoanOut(BaseModel):
    id: int
    customer_id: int
    bank_name: str
    loan_amount: Decimal
    status: LoanStatus
    emi_amount: Optional[Decimal] = None
    interest_rate: Optional[Decimal] = None
    tenure_months: Optional[int] = None
    model_config = {"from_attributes": True}


class InsuranceCreate(BaseModel):
    customer_id: int
    vehicle_id: Optional[int] = None
    insurer_name: str
    policy_number: str
    policy_type: str
    premium_amount: Decimal
    coverage_amount: Decimal
    start_date: datetime
    end_date: datetime


class InsuranceOut(InsuranceCreate):
    id: int
    status: InsuranceStatus
    model_config = {"from_attributes": True}


class EMICalcRequest(BaseModel):
    principal: Decimal
    annual_rate: Decimal
    tenure_months: int


class EMICalcResponse(BaseModel):
    emi: Decimal
    total_payment: Decimal
    total_interest: Decimal

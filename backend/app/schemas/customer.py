from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime


class CustomerBase(BaseModel):
    full_name: str
    email: Optional[EmailStr] = None
    phone: str
    alternate_phone: Optional[str] = None
    dob: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    occupation: Optional[str] = None
    notes: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    notes: Optional[str] = None


class CustomerOut(CustomerBase):
    id: int
    created_at: datetime
    model_config = {"from_attributes": True}

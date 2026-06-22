from sqlalchemy import Column, ForeignKey, Enum as SAEnum, Numeric, String, DateTime, Integer, Text
from sqlalchemy.orm import relationship

from app.db.base_class import Base
from app.models.enums import LoanStatus, InsuranceStatus


class LoanApplication(Base):
    customer_id = Column(ForeignKey("customers.id"), nullable=False)
    booking_id = Column(ForeignKey("bookings.id"), nullable=True)
    finance_executive_id = Column(ForeignKey("users.id"), nullable=True)

    bank_name = Column(String(120), nullable=False)
    loan_amount = Column(Numeric(12, 2), nullable=False)
    interest_rate = Column(Numeric(5, 2))
    tenure_months = Column(Integer)
    emi_amount = Column(Numeric(12, 2))
    status = Column(SAEnum(LoanStatus), default=LoanStatus.APPLIED)
    applied_at = Column(DateTime)
    approved_at = Column(DateTime, nullable=True)
    remarks = Column(Text)

    customer = relationship("Customer", back_populates="loan_applications")


class InsurancePolicy(Base):
    customer_id = Column(ForeignKey("customers.id"), nullable=False)
    vehicle_id = Column(ForeignKey("vehicles.id"), nullable=True)

    insurer_name = Column(String(120), nullable=False)
    policy_number = Column(String(60), unique=True)
    policy_type = Column(String(50))  # comprehensive, third_party
    premium_amount = Column(Numeric(12, 2))
    coverage_amount = Column(Numeric(12, 2))
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    status = Column(SAEnum(InsuranceStatus), default=InsuranceStatus.ACTIVE)
    claim_details = Column(Text)

    customer = relationship("Customer", back_populates="insurance_policies")

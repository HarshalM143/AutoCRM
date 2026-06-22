from sqlalchemy import Column, ForeignKey, Numeric, Text, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Quotation(Base):
    lead_id = Column(ForeignKey("leads.id"), nullable=False)
    vehicle_id = Column(ForeignKey("vehicles.id"), nullable=False)
    created_by_id = Column(ForeignKey("users.id"), nullable=True)

    ex_showroom_price = Column(Numeric(12, 2), nullable=False)
    accessories_cost = Column(Numeric(12, 2), default=0)
    tax_amount = Column(Numeric(12, 2), default=0)
    discount = Column(Numeric(12, 2), default=0)
    on_road_price = Column(Numeric(12, 2), nullable=False)
    emi_tenure_months = Column(String(20))
    emi_amount = Column(Numeric(12, 2))
    quote_number = Column(String(40), unique=True)
    status = Column(String(20), default="draft")  # draft, sent, accepted, rejected

    lead = relationship("Lead", back_populates="quotations")
    vehicle = relationship("Vehicle")

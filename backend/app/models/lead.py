from sqlalchemy import Column, String, Integer, ForeignKey, Enum as SAEnum, Text, DateTime
from sqlalchemy.orm import relationship

from app.db.base_class import Base
from app.models.enums import LeadStatus, LeadSource


class Lead(Base):
    customer_id = Column(ForeignKey("customers.id"), nullable=False)
    branch_id = Column(ForeignKey("branchs.id"), nullable=True)
    assigned_to_id = Column(ForeignKey("users.id"), nullable=True)
    interested_vehicle_id = Column(ForeignKey("vehicles.id"), nullable=True)

    status = Column(SAEnum(LeadStatus), default=LeadStatus.NEW, index=True)
    source = Column(SAEnum(LeadSource), default=LeadSource.WEBSITE)
    score = Column(Integer, default=0)  # AI lead score 0-100
    purchase_probability = Column(Integer, default=0)  # AI predicted %
    expected_close_date = Column(DateTime, nullable=True)
    next_follow_up = Column(DateTime, nullable=True)
    notes = Column(Text)

    customer = relationship("Customer", back_populates="leads")
    branch = relationship("Branch", back_populates="leads")
    assigned_to = relationship("User", back_populates="assigned_leads", foreign_keys=[assigned_to_id])
    interested_vehicle = relationship("Vehicle")
    activities = relationship("LeadActivity", back_populates="lead", cascade="all, delete-orphan")
    quotations = relationship("Quotation", back_populates="lead")


class LeadActivity(Base):
    lead_id = Column(ForeignKey("leads.id"), nullable=False)
    user_id = Column(ForeignKey("users.id"), nullable=True)
    activity_type = Column(String(50))  # call, email, note, status_change, whatsapp
    description = Column(Text)

    lead = relationship("Lead", back_populates="activities")

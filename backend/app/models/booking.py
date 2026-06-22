from sqlalchemy import Column, ForeignKey, Enum as SAEnum, Numeric, DateTime, Text, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base
from app.models.enums import BookingStatus


class Booking(Base):
    customer_id = Column(ForeignKey("customers.id"), nullable=False)
    vehicle_id = Column(ForeignKey("vehicles.id"), nullable=False)
    lead_id = Column(ForeignKey("leads.id"), nullable=True)
    sales_executive_id = Column(ForeignKey("users.id"), nullable=True)

    booking_number = Column(String(40), unique=True)
    booking_amount = Column(Numeric(12, 2))
    total_amount = Column(Numeric(12, 2))
    amount_paid = Column(Numeric(12, 2), default=0)
    status = Column(SAEnum(BookingStatus), default=BookingStatus.BOOKED)
    delivery_scheduled_at = Column(DateTime, nullable=True)
    delivery_completed_at = Column(DateTime, nullable=True)
    handover_checklist = Column(Text)  # JSON string
    notes = Column(Text)

    customer = relationship("Customer", back_populates="bookings")
    vehicle = relationship("Vehicle", back_populates="bookings")

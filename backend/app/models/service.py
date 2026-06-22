from sqlalchemy import Column, ForeignKey, Enum as SAEnum, Numeric, DateTime, Text, String, Integer
from sqlalchemy.orm import relationship

from app.db.base_class import Base
from app.models.enums import ServiceStatus


class ServiceJob(Base):
    customer_id = Column(ForeignKey("customers.id"), nullable=False)
    vehicle_id = Column(ForeignKey("vehicles.id"), nullable=True)
    service_advisor_id = Column(ForeignKey("users.id"), nullable=True)
    technician_id = Column(ForeignKey("users.id"), nullable=True)

    job_card_number = Column(String(40), unique=True)
    service_type = Column(String(80))  # periodic, repair, accident, recall
    description = Column(Text)
    scheduled_at = Column(DateTime)
    status = Column(SAEnum(ServiceStatus), default=ServiceStatus.BOOKED)
    estimated_cost = Column(Numeric(12, 2))
    final_cost = Column(Numeric(12, 2))
    recommendations = Column(Text)
    odometer_reading = Column(Integer)

    customer = relationship("Customer", back_populates="service_jobs")


class SparePart(Base):
    name = Column(String(150), nullable=False)
    part_number = Column(String(60), unique=True)
    category = Column(String(80))
    vendor = Column(String(150))
    unit_price = Column(Numeric(12, 2))
    stock_quantity = Column(Integer, default=0)
    low_stock_threshold = Column(Integer, default=10)
    warehouse_location = Column(String(80))


class PurchaseOrder(Base):
    spare_part_id = Column(ForeignKey("spareparts.id"), nullable=False)
    vendor = Column(String(150))
    quantity = Column(Integer)
    unit_price = Column(Numeric(12, 2))
    total_amount = Column(Numeric(12, 2))
    status = Column(String(30), default="pending")  # pending, received, cancelled
    ordered_at = Column(DateTime)
    received_at = Column(DateTime, nullable=True)

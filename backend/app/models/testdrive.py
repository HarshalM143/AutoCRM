from sqlalchemy import Column, ForeignKey, Enum as SAEnum, DateTime, Text, Integer
from sqlalchemy.orm import relationship

from app.db.base_class import Base
from app.models.enums import TestDriveStatus


class TestDrive(Base):
    customer_id = Column(ForeignKey("customers.id"), nullable=False)
    vehicle_id = Column(ForeignKey("vehicles.id"), nullable=False)
    lead_id = Column(ForeignKey("leads.id"), nullable=True)
    assigned_executive_id = Column(ForeignKey("users.id"), nullable=True)

    scheduled_at = Column(DateTime, nullable=False)
    route = Column(Text)
    status = Column(SAEnum(TestDriveStatus), default=TestDriveStatus.SCHEDULED)
    feedback = Column(Text)
    rating = Column(Integer, nullable=True)

    customer = relationship("Customer", back_populates="test_drives")
    vehicle = relationship("Vehicle", back_populates="test_drives")

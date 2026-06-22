from sqlalchemy import Column, String, Numeric, Integer, Boolean, ForeignKey, Enum as SAEnum, Text
from sqlalchemy.orm import relationship

from app.db.base_class import Base
from app.models.enums import VehicleCategory, VehicleStatus


class Vehicle(Base):
    model_name = Column(String(150), nullable=False)
    variant = Column(String(100))
    category = Column(SAEnum(VehicleCategory), nullable=False)
    fuel_type = Column(String(30))
    transmission = Column(String(30))
    color = Column(String(50))
    vin = Column(String(50), unique=True)
    registration_number = Column(String(30), nullable=True)
    ex_showroom_price = Column(Numeric(12, 2), nullable=False)
    on_road_price = Column(Numeric(12, 2))
    status = Column(SAEnum(VehicleStatus), default=VehicleStatus.AVAILABLE)
    stock_quantity = Column(Integer, default=1)
    low_stock_threshold = Column(Integer, default=3)
    branch_id = Column(ForeignKey("branchs.id"), nullable=True)
    specifications = Column(Text)  # JSON string: engine, mileage, seating etc.
    image_urls = Column(Text)  # JSON array string

    branch = relationship("Branch", back_populates="vehicles")
    test_drives = relationship("TestDrive", back_populates="vehicle")
    bookings = relationship("Booking", back_populates="vehicle")

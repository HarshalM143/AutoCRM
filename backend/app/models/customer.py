from sqlalchemy import Column, String, Date, Text
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Customer(Base):
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), index=True)
    phone = Column(String(20), index=True, nullable=False)
    alternate_phone = Column(String(20))
    dob = Column(Date, nullable=True)
    gender = Column(String(20))
    address = Column(String(255))
    city = Column(String(100))
    state = Column(String(100))
    pincode = Column(String(10))
    occupation = Column(String(100))
    notes = Column(Text)

    leads = relationship("Lead", back_populates="customer")
    test_drives = relationship("TestDrive", back_populates="customer")
    bookings = relationship("Booking", back_populates="customer")
    service_jobs = relationship("ServiceJob", back_populates="customer")
    loan_applications = relationship("LoanApplication", back_populates="customer")
    insurance_policies = relationship("InsurancePolicy", back_populates="customer")
    tickets = relationship("Ticket", back_populates="customer")
    documents = relationship("Document", back_populates="customer")
    communication_logs = relationship("CommunicationLog", back_populates="customer")

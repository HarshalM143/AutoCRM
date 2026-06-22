from sqlalchemy import Column, String, Boolean, ForeignKey, Enum as SAEnum, DateTime
from sqlalchemy.orm import relationship

from app.db.base_class import Base
from app.models.enums import UserRole


class Branch(Base):
    name = Column(String(150), nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    address = Column(String(255))
    city = Column(String(100))
    state = Column(String(100))
    pincode = Column(String(10))
    phone = Column(String(20))
    email = Column(String(120))
    is_active = Column(Boolean, default=True)

    users = relationship("User", back_populates="branch")
    leads = relationship("Lead", back_populates="branch")
    vehicles = relationship("Vehicle", back_populates="branch")


class User(Base):
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    phone = Column(String(20))
    hashed_password = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), nullable=False, default=UserRole.SALES_EXECUTIVE)
    branch_id = Column(ForeignKey("branchs.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    is_mfa_enabled = Column(Boolean, default=False)
    avatar_url = Column(String(255), nullable=True)
    last_login = Column(DateTime, nullable=True)

    branch = relationship("Branch", back_populates="users")
    assigned_leads = relationship("Lead", back_populates="assigned_to", foreign_keys="Lead.assigned_to_id")

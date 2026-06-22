from sqlalchemy import Column, ForeignKey, Enum as SAEnum, String, Text, DateTime, Boolean
from sqlalchemy.orm import relationship

from app.db.base_class import Base
from app.models.enums import CommunicationChannel


class CommunicationLog(Base):
    customer_id = Column(ForeignKey("customers.id"), nullable=False)
    user_id = Column(ForeignKey("users.id"), nullable=True)

    channel = Column(SAEnum(CommunicationChannel), nullable=False)
    direction = Column(String(10))  # inbound, outbound
    subject = Column(String(200))
    message = Column(Text)
    template_used = Column(String(100), nullable=True)

    customer = relationship("Customer", back_populates="communication_logs")


class MessageTemplate(Base):
    name = Column(String(150), nullable=False)
    channel = Column(SAEnum(CommunicationChannel), nullable=False)
    subject = Column(String(200), nullable=True)
    body = Column(Text, nullable=False)
    category = Column(String(60))  # follow_up, service_reminder, promo


class Notification(Base):
    user_id = Column(ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text)
    notif_type = Column(String(50))  # follow_up, service_due, loan_update, booking_update
    is_read = Column(Boolean, default=False)
    channel = Column(SAEnum(CommunicationChannel), default=CommunicationChannel.IN_APP)

from sqlalchemy import Column, ForeignKey, Enum as SAEnum, String, Text, DateTime
from sqlalchemy.orm import relationship

from app.db.base_class import Base
from app.models.enums import TicketStatus, TicketPriority


class Ticket(Base):
    customer_id = Column(ForeignKey("customers.id"), nullable=False)
    assigned_to_id = Column(ForeignKey("users.id"), nullable=True)

    ticket_number = Column(String(40), unique=True)
    subject = Column(String(200), nullable=False)
    description = Column(Text)
    category = Column(String(60))  # service, sales, billing, general
    priority = Column(SAEnum(TicketPriority), default=TicketPriority.MEDIUM)
    status = Column(SAEnum(TicketStatus), default=TicketStatus.OPEN)
    sla_due_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text)

    customer = relationship("Customer", back_populates="tickets")

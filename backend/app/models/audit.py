from sqlalchemy import Column, ForeignKey, String, Text, DateTime

from app.db.base_class import Base


class AuditLog(Base):
    user_id = Column(ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)  # login, create_lead, update_vehicle, etc.
    entity_type = Column(String(60))
    entity_id = Column(String(50), nullable=True)
    details = Column(Text)
    ip_address = Column(String(60))
    timestamp = Column(DateTime)

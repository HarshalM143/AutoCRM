from sqlalchemy import Column, ForeignKey, Enum as SAEnum, String, DateTime, Integer
from sqlalchemy.orm import relationship

from app.db.base_class import Base
from app.models.enums import DocumentType


class Document(Base):
    customer_id = Column(ForeignKey("customers.id"), nullable=False)
    uploaded_by_id = Column(ForeignKey("users.id"), nullable=True)

    doc_type = Column(SAEnum(DocumentType), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    version = Column(Integer, default=1)
    expiry_date = Column(DateTime, nullable=True)

    customer = relationship("Customer", back_populates="documents")

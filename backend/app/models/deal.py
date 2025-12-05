from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Float, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import uuid


class Deal(Base):
    __tablename__ = "deals"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    contact_id = Column(String, ForeignKey("contacts.id"), nullable=True)
    
    # Deal info
    title = Column(String, nullable=False)
    value = Column(Float, default=0.0)
    currency = Column(String, default="USD")
    
    # Pipeline stage
    stage = Column(String, default="lead")  # lead, qualified, proposal, negotiation, closed_won, closed_lost
    probability = Column(Integer, default=10)  # 0-100%
    
    # Dates
    expected_close_date = Column(DateTime, nullable=True)
    actual_close_date = Column(DateTime, nullable=True)
    
    # Notes
    notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="deals")
    contact = relationship("Contact", back_populates="deals")

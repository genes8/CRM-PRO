from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import uuid


class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    contact_id = Column(String, ForeignKey("contacts.id"), nullable=True)
    
    # Task info
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    # Type and priority
    task_type = Column(String, default="task")  # task, call, meeting, email, follow_up
    priority = Column(String, default="medium")  # low, medium, high, urgent
    
    # Status
    status = Column(String, default="pending")  # pending, in_progress, completed, cancelled
    is_completed = Column(Boolean, default=False)
    
    # Dates
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="tasks")
    contact = relationship("Contact", back_populates="tasks")

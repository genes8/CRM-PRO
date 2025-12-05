from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    task_type: Optional[str] = "task"
    priority: Optional[str] = "medium"
    status: Optional[str] = "pending"
    due_date: Optional[date] = None
    contact_id: Optional[str] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    task_type: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    is_completed: Optional[bool] = None
    due_date: Optional[date] = None
    contact_id: Optional[str] = None


class TaskResponse(BaseModel):
    id: str
    owner_id: str
    title: str
    description: Optional[str] = None
    task_type: Optional[str] = "task"
    priority: Optional[str] = "medium"
    status: Optional[str] = "pending"
    due_date: Optional[datetime] = None
    contact_id: Optional[str] = None
    is_completed: bool
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

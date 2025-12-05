from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional


class DealBase(BaseModel):
    title: str
    value: Optional[float] = 0.0
    currency: Optional[str] = "USD"
    stage: Optional[str] = "lead"
    probability: Optional[int] = 10
    expected_close_date: Optional[date] = None
    notes: Optional[str] = None
    contact_id: Optional[str] = None


class DealCreate(DealBase):
    pass


class DealUpdate(BaseModel):
    title: Optional[str] = None
    value: Optional[float] = None
    currency: Optional[str] = None
    stage: Optional[str] = None
    probability: Optional[int] = None
    expected_close_date: Optional[date] = None
    actual_close_date: Optional[date] = None
    notes: Optional[str] = None
    contact_id: Optional[str] = None


class DealResponse(BaseModel):
    id: str
    owner_id: str
    title: str
    value: Optional[float] = 0.0
    currency: Optional[str] = "USD"
    stage: Optional[str] = "lead"
    probability: Optional[int] = 10
    expected_close_date: Optional[datetime] = None
    actual_close_date: Optional[datetime] = None
    notes: Optional[str] = None
    contact_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

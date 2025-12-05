from pydantic import BaseModel
from typing import List


class DealsByStage(BaseModel):
    stage: str
    count: int
    total_value: float


class TasksByStatus(BaseModel):
    status: str
    count: int


class ContactsByStatus(BaseModel):
    status: str
    count: int


class RecentActivity(BaseModel):
    type: str  # contact, deal, task
    action: str  # created, updated, completed
    title: str
    timestamp: str


class AnalyticsResponse(BaseModel):
    total_contacts: int
    total_deals: int
    total_tasks: int
    total_deal_value: float
    deals_by_stage: List[DealsByStage]
    tasks_by_status: List[TasksByStatus]
    contacts_by_status: List[ContactsByStatus]
    conversion_rate: float
    tasks_completed_this_week: int
    deals_closed_this_month: int
    recent_activities: List[RecentActivity]

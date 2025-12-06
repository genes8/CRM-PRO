from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from app.database import get_db
from app.models.contact import Contact
from app.models.deal import Deal
from app.models.task import Task
from app.models.user import User
from app.schemas.analytics import AnalyticsResponse, DealsByStage, TasksByStatus, ContactsByStatus, RecentActivity, MonthlyRevenue, WeeklyRevenue, YearlyRevenue
from app.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("", response_model=AnalyticsResponse)
async def get_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analytics data for the current user"""
    
    # Total counts
    total_contacts = db.query(Contact).filter(Contact.owner_id == current_user.id).count()
    total_deals = db.query(Deal).filter(Deal.owner_id == current_user.id).count()
    total_tasks = db.query(Task).filter(Task.owner_id == current_user.id).count()
    
    # Total deal value
    total_deal_value = db.query(func.sum(Deal.value)).filter(
        Deal.owner_id == current_user.id
    ).scalar() or 0.0
    
    # Deals by stage
    deals_by_stage_query = db.query(
        Deal.stage,
        func.count(Deal.id).label('count'),
        func.sum(Deal.value).label('total_value')
    ).filter(Deal.owner_id == current_user.id).group_by(Deal.stage).all()
    
    deals_by_stage = [
        DealsByStage(stage=row[0], count=row[1], total_value=row[2] or 0.0)
        for row in deals_by_stage_query
    ]
    
    # Tasks by status
    tasks_by_status_query = db.query(
        Task.status,
        func.count(Task.id).label('count')
    ).filter(Task.owner_id == current_user.id).group_by(Task.status).all()
    
    tasks_by_status = [
        TasksByStatus(status=row[0], count=row[1])
        for row in tasks_by_status_query
    ]
    
    # Contacts by status
    contacts_by_status_query = db.query(
        Contact.status,
        func.count(Contact.id).label('count')
    ).filter(Contact.owner_id == current_user.id).group_by(Contact.status).all()
    
    contacts_by_status = [
        ContactsByStatus(status=row[0], count=row[1])
        for row in contacts_by_status_query
    ]
    
    # Conversion rate (customers / total contacts)
    customers_count = db.query(Contact).filter(
        Contact.owner_id == current_user.id,
        Contact.status == "customer"
    ).count()
    conversion_rate = (customers_count / total_contacts * 100) if total_contacts > 0 else 0.0
    
    # Tasks completed this week
    week_ago = datetime.utcnow() - timedelta(days=7)
    tasks_completed_this_week = db.query(Task).filter(
        Task.owner_id == current_user.id,
        Task.is_completed == True,
        Task.completed_at >= week_ago
    ).count()
    
    # Deals closed this month
    month_ago = datetime.utcnow() - timedelta(days=30)
    deals_closed_this_month = db.query(Deal).filter(
        Deal.owner_id == current_user.id,
        Deal.stage == "closed_won",
        Deal.actual_close_date >= month_ago
    ).count()
    
    # Recent activities
    recent_activities = []
    
    # Recent contacts
    recent_contacts = db.query(Contact).filter(
        Contact.owner_id == current_user.id
    ).order_by(Contact.created_at.desc()).limit(3).all()
    
    for contact in recent_contacts:
        recent_activities.append(RecentActivity(
            type="contact",
            action="created",
            title=f"{contact.first_name} {contact.last_name}",
            timestamp=contact.created_at.isoformat()
        ))
    
    # Recent deals
    recent_deals = db.query(Deal).filter(
        Deal.owner_id == current_user.id
    ).order_by(Deal.created_at.desc()).limit(3).all()
    
    for deal in recent_deals:
        recent_activities.append(RecentActivity(
            type="deal",
            action="created",
            title=deal.title,
            timestamp=deal.created_at.isoformat()
        ))
    
    # Recent completed tasks
    recent_completed_tasks = db.query(Task).filter(
        Task.owner_id == current_user.id,
        Task.is_completed == True
    ).order_by(Task.completed_at.desc()).limit(3).all()
    
    for task in recent_completed_tasks:
        recent_activities.append(RecentActivity(
            type="task",
            action="completed",
            title=task.title,
            timestamp=task.completed_at.isoformat() if task.completed_at else task.updated_at.isoformat()
        ))
    
    # Sort by timestamp
    recent_activities.sort(key=lambda x: x.timestamp, reverse=True)
    recent_activities = recent_activities[:10]

    # Monthly revenue (last 12 months)
    current_year = datetime.utcnow().year
    monthly_revenue = []
    for month in range(1, 13):
        month_start = datetime(current_year, month, 1)
        if month == 12:
            month_end = datetime(current_year + 1, 1, 1)
        else:
            month_end = datetime(current_year, month + 1, 1)

        month_deals = db.query(
            func.coalesce(func.sum(Deal.value), 0).label('revenue'),
            func.count(Deal.id).label('count')
        ).filter(
            Deal.owner_id == current_user.id,
            Deal.stage == "closed_won",
            Deal.actual_close_date >= month_start,
            Deal.actual_close_date < month_end
        ).first()

        monthly_revenue.append(MonthlyRevenue(
            month=month,
            year=current_year,
            revenue=float(month_deals[0]) if month_deals[0] else 0.0,
            deals_count=month_deals[1] if month_deals[1] else 0
        ))

    # Weekly revenue (last 7 weeks)
    weekly_revenue = []
    today = datetime.utcnow()
    for i in range(6, -1, -1):
        week_start = today - timedelta(days=today.weekday() + (i * 7))
        week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
        week_end = week_start + timedelta(days=7)

        week_deals = db.query(
            func.coalesce(func.sum(Deal.value), 0).label('revenue'),
            func.count(Deal.id).label('count')
        ).filter(
            Deal.owner_id == current_user.id,
            Deal.stage == "closed_won",
            Deal.actual_close_date >= week_start,
            Deal.actual_close_date < week_end
        ).first()

        weekly_revenue.append(WeeklyRevenue(
            week_start=week_start.strftime('%Y-%m-%d'),
            revenue=float(week_deals[0]) if week_deals[0] else 0.0,
            deals_count=week_deals[1] if week_deals[1] else 0
        ))

    # Yearly revenue (last 5 years)
    yearly_revenue = []
    for year in range(current_year - 4, current_year + 1):
        year_start = datetime(year, 1, 1)
        year_end = datetime(year + 1, 1, 1)

        year_deals = db.query(
            func.coalesce(func.sum(Deal.value), 0).label('revenue'),
            func.count(Deal.id).label('count')
        ).filter(
            Deal.owner_id == current_user.id,
            Deal.stage == "closed_won",
            Deal.actual_close_date >= year_start,
            Deal.actual_close_date < year_end
        ).first()

        yearly_revenue.append(YearlyRevenue(
            year=year,
            revenue=float(year_deals[0]) if year_deals[0] else 0.0,
            deals_count=year_deals[1] if year_deals[1] else 0
        ))

    return AnalyticsResponse(
        total_contacts=total_contacts,
        total_deals=total_deals,
        total_tasks=total_tasks,
        total_deal_value=total_deal_value,
        deals_by_stage=deals_by_stage,
        tasks_by_status=tasks_by_status,
        contacts_by_status=contacts_by_status,
        conversion_rate=round(conversion_rate, 2),
        tasks_completed_this_week=tasks_completed_this_week,
        deals_closed_this_month=deals_closed_this_month,
        recent_activities=recent_activities,
        monthly_revenue=monthly_revenue,
        weekly_revenue=weekly_revenue,
        yearly_revenue=yearly_revenue
    )

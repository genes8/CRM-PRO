from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.deal import Deal
from app.models.user import User
from app.schemas.deal import DealCreate, DealResponse, DealUpdate
from app.auth import get_current_user

router = APIRouter(prefix="/deals", tags=["Deals"])


@router.get("", response_model=List[DealResponse])
async def get_deals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    stage: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all deals for the current user"""
    query = db.query(Deal).filter(Deal.owner_id == current_user.id)
    
    if stage:
        query = query.filter(Deal.stage == stage)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(Deal.title.ilike(search_term))
    
    deals = query.order_by(Deal.created_at.desc()).offset(skip).limit(limit).all()
    return deals


@router.get("/{deal_id}", response_model=DealResponse)
async def get_deal(
    deal_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific deal"""
    deal = db.query(Deal).filter(
        Deal.id == deal_id,
        Deal.owner_id == current_user.id
    ).first()
    
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    return deal


@router.post("", response_model=DealResponse)
async def create_deal(
    deal_data: DealCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new deal"""
    deal = Deal(
        owner_id=current_user.id,
        **deal_data.model_dump()
    )
    db.add(deal)
    db.commit()
    db.refresh(deal)
    return deal


@router.put("/{deal_id}", response_model=DealResponse)
async def update_deal(
    deal_id: str,
    deal_data: DealUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a deal"""
    deal = db.query(Deal).filter(
        Deal.id == deal_id,
        Deal.owner_id == current_user.id
    ).first()
    
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    update_data = deal_data.model_dump(exclude_unset=True)
    
    # Handle stage changes
    if "stage" in update_data:
        new_stage = update_data["stage"]
        if new_stage in ["closed_won", "closed_lost"] and deal.stage not in ["closed_won", "closed_lost"]:
            update_data["actual_close_date"] = datetime.utcnow()
    
    for field, value in update_data.items():
        setattr(deal, field, value)
    
    db.commit()
    db.refresh(deal)
    return deal


@router.delete("/{deal_id}")
async def delete_deal(
    deal_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a deal"""
    deal = db.query(Deal).filter(
        Deal.id == deal_id,
        Deal.owner_id == current_user.id
    ).first()
    
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    db.delete(deal)
    db.commit()
    return {"message": "Deal deleted successfully"}

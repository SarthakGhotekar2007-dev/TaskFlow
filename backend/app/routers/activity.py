from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas import ActivityLogResponse, UserResponse
from app.services.activity_service import get_activities

router = APIRouter(
    prefix="/activity",
    tags=["Activity"]
)

@router.get("/", response_model=List[ActivityLogResponse])
def read_activity_logs(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    # Depending on RBAC, we might filter to show only user's activities 
    # if they are not an admin/manager. For now, returning top 50.
    if current_user.role == "user":
        # Only return their own activities
        from app.models import ActivityLog
        return db.query(ActivityLog).filter(ActivityLog.user_id == current_user.id).order_by(ActivityLog.created_at.desc()).limit(50).all()
    
    return get_activities(db, limit=50)

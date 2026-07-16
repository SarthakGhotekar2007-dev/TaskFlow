from sqlalchemy.orm import Session
from app.models import ActivityLog
from datetime import datetime

def log_activity(db: Session, user_id: int, action: str, description: str = None, task_id: int = None):
    new_log = ActivityLog(
        user_id=user_id,
        action=action,
        description=description,
        task_id=task_id,
        created_at=datetime.utcnow()
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

def get_activities(db: Session, limit: int = 50):
    return db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(limit).all()

from sqlalchemy.orm import Session
from app.models import Task
from sqlalchemy import func
from datetime import datetime, timedelta

class DashboardRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_task_counts(self, user_id: int):
        total = self.db.query(Task).filter(Task.user_id == user_id).count()
        completed = self.db.query(Task).filter(Task.user_id == user_id, Task.completed == True).count()
        pending = total - completed
        overdue = self.db.query(Task).filter(
            Task.user_id == user_id, 
            Task.completed == False, 
            Task.due_date < datetime.utcnow()
        ).count()
        
        return {
            "total_tasks": total,
            "completed_tasks": completed,
            "pending_tasks": pending,
            "overdue_tasks": overdue
        }

    def get_recent_completed_tasks(self, user_id: int, days: int = 7):
        start_date = datetime.utcnow() - timedelta(days=days)
        return self.db.query(Task).filter(
            Task.user_id == user_id,
            Task.completed == True,
            Task.updated_at >= start_date
        ).all()

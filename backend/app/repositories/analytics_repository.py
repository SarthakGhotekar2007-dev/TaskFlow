from sqlalchemy.orm import Session
from app.models import Task, UserStatistic, ProductivityLog
from sqlalchemy import func
from datetime import datetime, timedelta

class AnalyticsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_statistics(self, user_id: int):
        return self.db.query(UserStatistic).filter(UserStatistic.user_id == user_id).first()

    def get_productivity_logs(self, user_id: int, days: int = 7):
        start_date = datetime.utcnow() - timedelta(days=days)
        return self.db.query(ProductivityLog).filter(
            ProductivityLog.user_id == user_id,
            ProductivityLog.date >= start_date
        ).order_by(ProductivityLog.date.asc()).all()

    def get_team_performance(self, team_id: int):
        # A simple aggregation of completed tasks by users in a team
        # Mocking or simplified query for demonstration
        results = self.db.query(
            Task.assigned_to, 
            func.count(Task.id).label('completed_count')
        ).filter(
            Task.team_id == team_id,
            Task.completed == True
        ).group_by(Task.assigned_to).all()
        return results

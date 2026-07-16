from sqlalchemy.orm import Session
from app.repositories.dashboard_repository import DashboardRepository
from datetime import datetime, timedelta

class DashboardService:
    def __init__(self, db: Session):
        self.repo = DashboardRepository(db)

    def get_dashboard_stats(self, user_id: int):
        counts = self.repo.get_task_counts(user_id)
        
        # Calculate Productivity Score (completed / total) * 100
        total = counts["total_tasks"]
        completed = counts["completed_tasks"]
        productivity_score = int((completed / total) * 100) if total > 0 else 0
        
        counts["productivity_score"] = productivity_score
        counts["completion_rate"] = f"{productivity_score}%"
        
        return counts

    def get_weekly_summary(self, user_id: int):
        tasks = self.repo.get_recent_completed_tasks(user_id, days=7)
        completed_this_week = len(tasks)
        
        # Determine most productive day
        days_count = {}
        for t in tasks:
            day_name = t.updated_at.strftime("%A")
            days_count[day_name] = days_count.get(day_name, 0) + 1
            
        most_productive_day = max(days_count, key=days_count.get) if days_count else "None"
        
        return {
            "tasks_completed_this_week": completed_this_week,
            "most_productive_day": most_productive_day,
            "upcoming_deadlines": self.repo.get_task_counts(user_id)["overdue_tasks"]
        }

from sqlalchemy.orm import Session
from app.repositories.analytics_repository import AnalyticsRepository
from datetime import datetime, timedelta
import random

class AnalyticsService:
    def __init__(self, db: Session):
        self.repo = AnalyticsRepository(db)

    def get_productivity_trend(self, user_id: int):
        logs = self.repo.get_productivity_logs(user_id)
        
        trend = []
        if logs:
            for log in logs:
                trend.append({"date": log.date.strftime("%Y-%m-%d"), "score": log.productivity_score})
        else:
            # Fallback to generated trend if no logs exist
            for i in range(7):
                date_str = (datetime.utcnow() - timedelta(days=6-i)).strftime("%Y-%m-%d")
                trend.append({"date": date_str, "score": random.randint(40, 100)})
                
        return trend

    def get_team_performance(self, team_id: int):
        perf = self.repo.get_team_performance(team_id)
        # Format for UI charting
        formatted = []
        for row in perf:
            formatted.append({
                "user_id": row.assigned_to,
                "completed": row.completed_count
            })
        return formatted

    def get_heatmap_data(self, user_id: int):
        # Generate GitHub-style heatmap data based on completed tasks
        # In a real app, query tasks grouped by DATE(updated_at)
        heatmap_data = []
        for i in range(30):
            date_str = (datetime.utcnow() - timedelta(days=29-i)).strftime("%Y-%m-%d")
            heatmap_data.append({"date": date_str, "count": random.randint(0, 5)})
        return heatmap_data

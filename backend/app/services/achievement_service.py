from sqlalchemy.orm import Session
from app.models import UserAchievement, Achievement
from datetime import datetime

class AchievementService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_achievements(self, user_id: int):
        return self.db.query(UserAchievement).filter(UserAchievement.user_id == user_id).all()

    def check_and_award_achievements(self, user_id: int, stats: dict):
        # Logic to award achievements based on stats
        # E.g., if stats['completed_tasks'] >= 10, award '10 Tasks Completed'
        completed = stats.get('completed_tasks', 0)
        
        achievements_won = []
        if completed >= 1:
            ach = self.db.query(Achievement).filter(Achievement.title == "First Task").first()
            if ach:
                # Check if already has it
                has = self.db.query(UserAchievement).filter(
                    UserAchievement.user_id == user_id, 
                    UserAchievement.achievement_id == ach.id
                ).first()
                if not has:
                    ua = UserAchievement(user_id=user_id, achievement_id=ach.id, earned_at=datetime.utcnow())
                    self.db.add(ua)
                    achievements_won.append(ach)
        
        self.db.commit()
        return achievements_won

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models import User
from app.services.dashboard_service import DashboardService
from app.services.analytics_service import AnalyticsService
from app.services.achievement_service import AchievementService

router = APIRouter(prefix="/dashboard", tags=["Analytics & Dashboard"])

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = DashboardService(db)
    return service.get_dashboard_stats(current_user.id)

@router.get("/productivity")
def get_productivity(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = AnalyticsService(db)
    trend = service.get_productivity_trend(current_user.id)
    return {"trend": trend, "current_score": trend[-1]["score"] if trend else 0}

@router.get("/weekly-summary")
def get_weekly_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = DashboardService(db)
    return service.get_weekly_summary(current_user.id)

@router.get("/team-performance")
def get_team_performance(team_id: int = 1, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = AnalyticsService(db)
    # Using team_id 1 as default for demonstration
    return {"members": service.get_team_performance(team_id)}

@router.get("/heatmap")
def get_heatmap(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = AnalyticsService(db)
    return service.get_heatmap_data(current_user.id)

@router.get("/achievements")
def get_achievements(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = AchievementService(db)
    # Simulate checking/awarding on fetch
    dash = DashboardService(db)
    stats = dash.get_dashboard_stats(current_user.id)
    service.check_and_award_achievements(current_user.id, stats)
    
    achievements = service.get_user_achievements(current_user.id)
    return achievements

@router.get("/activity-feed")
def get_activity_feed(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.services.activity_service import ActivityService
    service = ActivityService(db)
    return service.get_activity(current_user.id, limit=10)

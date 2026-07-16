from sqlalchemy.orm import Session
from app.repositories.report_repository import ReportRepository

class ReportService:
    def __init__(self, db: Session):
        self.repo = ReportRepository(db)

    def generate_weekly_report(self, user_id: int):
        content = "# Weekly Report\n\nYou did great this week! Completed 15 tasks."
        return self.repo.create_report(user_id, "weekly", content)

    def generate_monthly_report(self, user_id: int):
        content = "# Monthly Report\n\nProductivity increased by 10% this month."
        return self.repo.create_report(user_id, "monthly", content)

    def get_user_reports(self, user_id: int):
        return self.repo.get_reports_by_user(user_id)

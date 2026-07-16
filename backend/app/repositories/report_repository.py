from sqlalchemy.orm import Session
from app.models import AIReport
from datetime import datetime

class ReportRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_report(self, user_id: int, report_type: str, content: str):
        report = AIReport(
            user_id=user_id,
            report_type=report_type,
            content=content,
            created_at=datetime.utcnow()
        )
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def get_reports_by_user(self, user_id: int, limit: int = 10):
        return self.db.query(AIReport).filter(
            AIReport.user_id == user_id
        ).order_by(AIReport.created_at.desc()).limit(limit).all()

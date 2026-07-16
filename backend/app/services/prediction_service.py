from sqlalchemy.orm import Session
from app.providers.openai_provider import OpenAIProvider
from datetime import datetime, timedelta

class PredictionService:
    def __init__(self, db: Session):
        self.db = db
        self.provider = OpenAIProvider()

    def predict_deadline(self, task_title: str, task_description: str):
        # Uses AI to estimate completion time based on task text
        # Mocking output for now
        predicted_date = (datetime.utcnow() + timedelta(days=3)).strftime("%Y-%m-%dT%H:%M:%SZ")
        
        # Randomly choose a status for demonstration
        status = "On Time" if "easy" in task_description.lower() else "At Risk"
        
        return {
            "predicted_date": predicted_date,
            "status": status,
            "confidence": "High"
        }

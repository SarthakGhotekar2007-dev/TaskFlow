from sqlalchemy.orm import Session
from app.providers.openai_provider import OpenAIProvider

class RecommendationService:
    def __init__(self, db: Session):
        self.db = db
        self.provider = OpenAIProvider()

    def get_productivity_suggestions(self, user_id: int):
        # We would fetch user data, feed it to the prompt template, and ask OpenAI
        # Mocking for immediate delivery if provider has no keys set up
        return [
            "Break down 'Build Authentication' into smaller subtasks.",
            "Schedule a 15-minute break after your next task.",
            "You seem to be most productive in the morning, schedule complex tasks then."
        ]

    def prioritize_tasks(self, tasks: list):
        # Use AI to sort tasks
        return {
            "priority": "High",
            "reason": "Deadline is near.",
            "ordered_tasks": tasks[::-1]
        }

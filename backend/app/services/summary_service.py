import json
from app.providers.openai_provider import OpenAIProvider

REPORT_PROMPT = """
You are an AI Data Analyst for TaskFlow.
Based on the provided task data and user activity, generate a comprehensive, professional, and encouraging summary report in Markdown format.
Focus on key achievements, areas for improvement, and overall productivity trends.
"""

class SummaryService:
    def __init__(self):
        self.provider = OpenAIProvider()

    def generate_report(self, user_name: str, report_type: str, data: dict) -> str:
        prompt = f"""
        User: {user_name}
        Report Type: {report_type.capitalize()} Report
        
        Data to Analyze:
        {json.dumps(data, indent=2)}
        
        Please generate the markdown report now.
        """
        
        # We use generate_text because we want markdown output, not JSON
        report = self.provider.generate_text(prompt, system_prompt=REPORT_PROMPT)
        return report

def generate_weekly_summary(db, user_id: int) -> str:
    # Dummy implementation to fix ImportError
    return "You completed 10 tasks this week. Great job!"


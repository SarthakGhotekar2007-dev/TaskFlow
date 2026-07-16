from app.database import SessionLocal
from app.models import Achievement

def seed_achievements():
    db = SessionLocal()
    
    default_achievements = [
        {
            "title": "First Task",
            "description": "Completed your first task.",
            "icon": "🏆",
            "points": 10
        },
        {
            "title": "10 Tasks Completed",
            "description": "Completed 10 tasks in total.",
            "icon": "🚀",
            "points": 50
        },
        {
            "title": "100 Tasks Completed",
            "description": "Completed 100 tasks. You are a machine!",
            "icon": "💯",
            "points": 200
        },
        {
            "title": "7 Day Streak",
            "description": "Completed at least one task for 7 consecutive days.",
            "icon": "🔥",
            "points": 100
        },
        {
            "title": "Team Leader",
            "description": "Created and managed your first team.",
            "icon": "👑",
            "points": 50
        },
        {
            "title": "Productivity Master",
            "description": "Achieved a 100% completion rate for a week.",
            "icon": "⭐",
            "points": 500
        }
    ]
    
    for a in default_achievements:
        existing = db.query(Achievement).filter(Achievement.title == a["title"]).first()
        if not existing:
            achievement = Achievement(**a)
            db.add(achievement)
            print(f"Added achievement: {a['title']}")
            
    db.commit()
    db.close()
    print("Seeding complete.")

if __name__ == "__main__":
    seed_achievements()

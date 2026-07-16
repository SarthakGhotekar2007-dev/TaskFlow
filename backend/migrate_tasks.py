import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv(".env")
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

with engine.begin() as conn:
    try:
        conn.execute(text("ALTER TABLE tasks ADD COLUMN priority VARCHAR DEFAULT 'Low'"))
        print("Added priority")
    except Exception as e:
        print("priority Error:", e)

    try:
        conn.execute(text("ALTER TABLE tasks ADD COLUMN due_date TIMESTAMP"))
        print("Added due_date")
    except Exception as e:
        print("due_date Error:", e)
        
    try:
        conn.execute(text("ALTER TABLE tasks ADD COLUMN category VARCHAR DEFAULT 'General'"))
        print("Added category")
    except Exception as e:
        print("category Error:", e)

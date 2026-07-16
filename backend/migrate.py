import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv(".env") # Or where it is
# Let's load the url
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE tasks ADD COLUMN priority VARCHAR DEFAULT 'Low'"))
        print("Added priority")
except Exception as e:
    print("Priority Error:", e)

try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE tasks ADD COLUMN due_date TIMESTAMP"))
        print("Added due_date")
except Exception as e:
    print("Due Date Error:", e)

try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE tasks ADD COLUMN category VARCHAR DEFAULT 'General'"))
        print("Added category")
except Exception as e:
    print("Category Error:", e)

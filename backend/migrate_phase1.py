import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv(".env")
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

with engine.begin() as conn:
    try:
        conn.execute(text("ALTER TABLE tasks ADD COLUMN assigned_to INTEGER REFERENCES users(id)"))
        print("Added assigned_to")
    except Exception as e:
        print("assigned_to Error:", e)

    try:
        conn.execute(text("ALTER TABLE tasks ADD COLUMN assigned_by INTEGER REFERENCES users(id)"))
        print("Added assigned_by")
    except Exception as e:
        print("assigned_by Error:", e)
        
    try:
        conn.execute(text("ALTER TABLE tasks ADD COLUMN assigned_at TIMESTAMP"))
        print("Added assigned_at")
    except Exception as e:
        print("assigned_at Error:", e)

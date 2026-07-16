import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv(".env")
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

with engine.begin() as conn:
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN google_id VARCHAR UNIQUE"))
        print("Added google_id")
    except Exception as e:
        print("google_id Error:", e)

    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN profile_image VARCHAR"))
        print("Added profile_image")
    except Exception as e:
        print("profile_image Error:", e)
        
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN is_google_user BOOLEAN DEFAULT FALSE"))
        print("Added is_google_user")
    except Exception as e:
        print("is_google_user Error:", e)

from sqlalchemy import text
from app.database import engine

def migrate_rbac():
    print("Starting RBAC Database Migration...")
    try:
        with engine.begin() as conn:
            # 1. Add role column to users table
            print("Adding 'role' column to users table...")
            # Using plain SQL to add the column if it doesn't exist.
            # We wrap it in a generic way or just execute and catch error if it exists.
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user' NOT NULL;"))
                print("Successfully added 'role' column.")
            except Exception as e:
                if "already exists" in str(e).lower() or "duplicate column name" in str(e).lower():
                    print("'role' column already exists.")
                else:
                    raise e
            
        print("Migration Complete.")
    except Exception as e:
        print(f"Migration Failed: {e}")

if __name__ == "__main__":
    migrate_rbac()

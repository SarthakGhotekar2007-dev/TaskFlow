from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from app.database import engine
from app.models import Base
from app.routers import tasks, auth, activity, websocket, organizations, teams, notifications, users, analytics, kanban, profile
from fastapi.staticfiles import StaticFiles
import os
import logging

# Set up limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Management API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Global Error: {exc}")
    origin = request.headers.get("origin")
    headers = {}
    if origin in [
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:5174", "http://127.0.0.1:5174",
        "http://localhost:5175", "http://127.0.0.1:5175"
    ]:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Access-Control-Allow-Methods"] = "*"
        headers["Access-Control-Allow-Headers"] = "*"
        
    return JSONResponse(
        status_code=500,
        content={"message": "An unexpected server error occurred.", "details": str(exc)},
        headers=headers
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:5174", "http://127.0.0.1:5174",
        "http://localhost:5175", "http://127.0.0.1:5175"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(activity.router)
app.include_router(websocket.router)
app.include_router(organizations.router)
app.include_router(teams.router)
app.include_router(notifications.router)
app.include_router(users.router)
app.include_router(profile.router)
app.include_router(analytics.router)
app.include_router(kanban.router)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/")
def home():
    return {"message": "Welcome to SaaS Task Management API"}
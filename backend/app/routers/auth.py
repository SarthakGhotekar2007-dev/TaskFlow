from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.schemas import UserCreate, UserLogin, GoogleLoginRequest, Token
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token
)
from app.core.firebase_config import verify_google_token
import secrets

router = APIRouter(prefix="/auth", tags=["Auth"])

# 🟢 REGISTER
@router.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(models.User).filter(models.User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    username = user.email.split("@")[0]

    new_user = models.User(
        username=username,
        email=user.email,
        password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token = create_access_token({"user_id": new_user.id})
    
    # Log Activity
    from app.services.activity_service import log_activity
    log_activity(db, new_user.id, "User Registered", f"User {new_user.username} registered")

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }

# 🔵 LOGIN
@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):

    db_user = db.query(models.User).filter(models.User.email == user.email).first()

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token({"user_id": db_user.id})
    
    # Log Activity
    from app.services.activity_service import log_activity
    log_activity(db, db_user.id, "User Login", f"User {db_user.username} logged in")

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": db_user
    }

# 🔴 LOGOUT
from app.dependencies import get_current_user
@router.post("/logout")
def logout(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    from app.services.activity_service import log_activity
    log_activity(db, current_user.id, "User Logout", f"User {current_user.username} logged out")
    return {"message": "Logged out successfully"}

# 🟢 REFRESH TOKEN
@router.post("/refresh", response_model=Token)
def refresh_token(current_user = Depends(get_current_user)):
    # Issue a new access token for the authenticated user
    token = create_access_token({"user_id": current_user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": current_user
    }

# 🟠 GOOGLE LOGIN
@router.post("/google", response_model=Token)
def google_login(request: GoogleLoginRequest, db: Session = Depends(get_db)):
    try:
        decoded_token = verify_google_token(request.token)
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")

    email = decoded_token.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by Google")

    # 1. Check if user exists
    db_user = db.query(models.User).filter(models.User.email == email).first()

    if not db_user:
        # Create a secure random password since this is a Google user
        random_password = secrets.token_urlsafe(32)
        
        db_user = models.User(
            username=decoded_token.get("name", email.split("@")[0]),
            email=email,
            password=hash_password(random_password),
            google_id=decoded_token.get("uid"),
            profile_image=decoded_token.get("picture"),
            is_google_user=True
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    else:
        # User exists, optionally update google fields if linking
        if not db_user.google_id:
            db_user.google_id = decoded_token.get("uid")
            db_user.profile_image = decoded_token.get("picture") or db_user.profile_image
            db_user.is_google_user = True
            db.commit()
            db.refresh(db_user)

    # Generate token
    token = create_access_token({"user_id": db_user.id})

    # Log Activity
    from app.services.activity_service import log_activity
    log_activity(db, db_user.id, "User Login", f"User {db_user.username} logged in via Google")

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": db_user
    }
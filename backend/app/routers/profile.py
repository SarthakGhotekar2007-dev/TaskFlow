from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("", response_model=schemas.ProfileResponse)
def get_profile(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.post("", response_model=schemas.ProfileResponse, status_code=status.HTTP_201_CREATED)
def create_profile(profile_in: schemas.ProfileCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    existing = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")
    
    new_profile = models.Profile(
        user_id=current_user.id,
        **profile_in.dict()
    )
    db.add(new_profile)
    
    # Mark user profile as completed
    current_user.profile_completed = True
    db.add(current_user)
    
    db.commit()
    db.refresh(new_profile)
    return new_profile

@router.put("", response_model=schemas.ProfileResponse)
def update_profile(profile_in: schemas.ProfileUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if not profile:
        # Create it if it doesn't exist yet
        profile = models.Profile(user_id=current_user.id)
        db.add(profile)
    
    # Update fields
    update_data = profile_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
        
    db.add(profile)
    
    # Sync profile_image to user model as well for backward compatibility
    if "profile_image" in update_data and update_data["profile_image"]:
        current_user.profile_image = update_data["profile_image"]
    
    # Mark user profile as completed
    current_user.profile_completed = True
    db.add(current_user)
    
    db.commit()
    db.refresh(profile)
    return profile

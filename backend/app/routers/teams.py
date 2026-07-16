from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user

router = APIRouter(
    prefix="/teams",
    tags=["Teams"]
)

@router.post("/", response_model=schemas.TeamResponse)
def create_team(team: schemas.TeamCreate, organization_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    org = db.query(models.Organization).filter(models.Organization.id == organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    db_team = models.Team(organization_id=organization_id, name=team.name, description=team.description)
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    
    # Add creator as Owner of the team
    db_member = models.TeamMember(team_id=db_team.id, user_id=current_user.id, role="Owner")
    db.add(db_member)
    db.commit()
    
    return db_team

@router.get("/", response_model=List[schemas.TeamResponse])
def get_teams(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # User is in these teams
    team_memberships = db.query(models.TeamMember).filter(models.TeamMember.user_id == current_user.id).all()
    team_ids = [tm.team_id for tm in team_memberships]
    teams = db.query(models.Team).filter(models.Team.id.in_(team_ids)).all()
    return teams

@router.put("/{team_id}", response_model=schemas.TeamResponse)
def update_team(team_id: int, team: schemas.TeamUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    member = db.query(models.TeamMember).filter(models.TeamMember.team_id == team_id, models.TeamMember.user_id == current_user.id).first()
    if not member or member.role not in ["Owner", "Manager"]:
        raise HTTPException(status_code=403, detail="Not authorized to update team")

    if team.name:
        db_team.name = team.name
    if team.description:
        db_team.description = team.description
        
    db.commit()
    db.refresh(db_team)
    return db_team

@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team(team_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    member = db.query(models.TeamMember).filter(models.TeamMember.team_id == team_id, models.TeamMember.user_id == current_user.id).first()
    if not member or member.role != "Owner":
        raise HTTPException(status_code=403, detail="Only owner can delete team")
        
    db.delete(db_team)
    db.commit()
    return None

@router.post("/{team_id}/members")
def add_member(team_id: int, user_id: int, role: str = "Member", db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    member = db.query(models.TeamMember).filter(models.TeamMember.team_id == team_id, models.TeamMember.user_id == current_user.id).first()
    if not member or member.role not in ["Owner", "Manager"]:
        raise HTTPException(status_code=403, detail="Not authorized to add members")
        
    existing = db.query(models.TeamMember).filter(models.TeamMember.team_id == team_id, models.TeamMember.user_id == user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already in team")
        
    new_member = models.TeamMember(team_id=team_id, user_id=user_id, role=role)
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    
    return {"message": "Member added successfully"}

@router.delete("/{team_id}/members/{user_id}")
def remove_member(team_id: int, user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    member = db.query(models.TeamMember).filter(models.TeamMember.team_id == team_id, models.TeamMember.user_id == current_user.id).first()
    if not member or member.role not in ["Owner", "Manager"]:
        raise HTTPException(status_code=403, detail="Not authorized to remove members")
        
    target_member = db.query(models.TeamMember).filter(models.TeamMember.team_id == team_id, models.TeamMember.user_id == user_id).first()
    if not target_member:
        raise HTTPException(status_code=404, detail="Member not found in team")
        
    db.delete(target_member)
    db.commit()
    return {"message": "Member removed"}

@router.get("/{team_id}/members", response_model=List[schemas.TeamMemberResponse])
def get_members(team_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    members = db.query(models.TeamMember).filter(models.TeamMember.team_id == team_id).all()
    return members

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user

router = APIRouter(
    prefix="/organizations",
    tags=["Organizations"]
)

@router.post("/", response_model=schemas.OrganizationResponse)
def create_organization(org: schemas.OrganizationCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_org = models.Organization(name=org.name, owner_id=current_user.id)
    db.add(db_org)
    db.commit()
    db.refresh(db_org)
    return db_org

@router.get("/", response_model=List[schemas.OrganizationResponse])
def get_organizations(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Organizations owned by user, or where user is in a team of that org
    owned = db.query(models.Organization).filter(models.Organization.owner_id == current_user.id).all()
    # Also get orgs from team memberships
    team_memberships = db.query(models.TeamMember).filter(models.TeamMember.user_id == current_user.id).all()
    team_org_ids = [tm.team.organization_id for tm in team_memberships]
    member_orgs = db.query(models.Organization).filter(models.Organization.id.in_(team_org_ids)).all()
    
    # Merge and distinct
    all_orgs = {org.id: org for org in owned + member_orgs}
    return list(all_orgs.values())

@router.put("/{org_id}", response_model=schemas.OrganizationResponse)
def update_organization(org_id: int, org: schemas.OrganizationUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_org = db.query(models.Organization).filter(models.Organization.id == org_id).first()
    if not db_org:
        raise HTTPException(status_code=404, detail="Organization not found")
    if db_org.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only owner can update organization")
        
    if org.name is not None:
        db_org.name = org.name
        
    db.commit()
    db.refresh(db_org)
    return db_org

@router.delete("/{org_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_organization(org_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_org = db.query(models.Organization).filter(models.Organization.id == org_id).first()
    if not db_org:
        raise HTTPException(status_code=404, detail="Organization not found")
    if db_org.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only owner can delete organization")
        
    db.delete(db_org)
    db.commit()
    return None

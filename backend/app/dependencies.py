from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from app.utils.security import decode_token
from app import models
from app.database import get_db
from sqlalchemy.orm import Session

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# 🔐 GET CURRENT USER
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    payload = decode_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("user_id")

    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user

# 🛡️ ROLE BASED ACCESS CONTROL (RBAC)
class RoleChecker:
    def __init__(self, allowed_roles: list):
        self.allowed_roles = allowed_roles

    def __call__(self, user: models.User = Depends(get_current_user)):
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="Access Denied: Insufficient permissions"
            )
        return user

def require_team_role(allowed_roles: list):
    """ Dependency factory for checking team-level roles """
    def check_team_role(
        team_id: int, 
        user: models.User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        if user.role == "admin":  # Global admin overrides
            return user
            
        member = db.query(models.TeamMember).filter(
            models.TeamMember.team_id == team_id,
            models.TeamMember.user_id == user.id
        ).first()
        
        if not member or member.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="Access Denied: Insufficient team permissions"
            )
        return user
    return check_team_role

def require_org_role(allowed_roles: list):
    """ Dependency factory for checking org-level permissions (e.g. through Teams) """
    def check_org_role(
        org_id: int, 
        user: models.User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        if user.role == "admin": 
            return user
            
        org = db.query(models.Organization).filter(models.Organization.id == org_id).first()
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")
            
        if org.owner_id == user.id and "Owner" in allowed_roles:
            return user
            
        # Optional: check if they are manager of any team in the org if "Manager" is allowed
        # (Simplified for now)
        raise HTTPException(
            status_code=403,
            detail="Access Denied: Insufficient organization permissions"
        )
    return check_org_role
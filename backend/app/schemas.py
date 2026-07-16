from pydantic import BaseModel, EmailStr
from datetime import datetime

# 👤 REGISTER
class UserCreate(BaseModel):
    email: EmailStr
    password: str

# 🔑 LOGIN
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ProfileBase(BaseModel):
    full_name: str | None = None
    phone_number: str | None = None
    job_title: str | None = None
    organization: str | None = None
    team: str | None = None
    location: str | None = None
    bio: str | None = None
    profile_image: str | None = None
    theme_preference: str | None = "dark"
    language: str | None = "en"
    timezone: str | None = "UTC"

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    profile_image: str | None = None
    is_google_user: bool = False
    profile_completed: bool = False
    profile: ProfileResponse | None = None
    
    class Config:
        from_attributes = True

# 🎟 TOKEN RESPONSE
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse | None = None

# 🟠 GOOGLE LOGIN
class GoogleLoginRequest(BaseModel):
    token: str

class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    priority: str | None = "Low"
    due_date: datetime | None = None
    category: str | None = "General"
    notes: str | None = None
    recurrence: str | None = None
    attachments: str | None = None
    assigned_to: int | None = None
    status: str | None = "Todo"
    parent_id: int | None = None
    position: int | None = 0
    start_date: datetime | None = None
    organization_id: int | None = None
    team_id: int | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    completed: bool | None = None
    priority: str | None = None
    due_date: datetime | None = None
    category: str | None = None
    notes: str | None = None
    recurrence: str | None = None
    attachments: str | None = None
    assigned_to: int | None = None
    status: str | None = None
    archived: bool | None = None
    parent_id: int | None = None
    position: int | None = None
    start_date: datetime | None = None
    organization_id: int | None = None
    team_id: int | None = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str | None
    completed: bool
    status: str | None
    archived: bool | None
    priority: str | None
    due_date: datetime | None
    start_date: datetime | None
    category: str | None
    created_at: datetime
    notes: str | None
    recurrence: str | None
    attachments: str | None
    assigned_to: int | None
    assigned_by: int | None
    assigned_at: datetime | None
    parent_id: int | None
    position: int | None
    organization_id: int | None
    team_id: int | None

    class Config:
        from_attributes = True

class ActivityLogResponse(BaseModel):
    id: int
    user_id: int
    task_id: int | None = None
    action: str
    description: str | None = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class OrganizationCreate(BaseModel):
    name: str

class OrganizationUpdate(BaseModel):
    name: str | None = None

class OrganizationResponse(BaseModel):
    id: int
    name: str
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class TeamCreate(BaseModel):
    name: str
    description: str | None = None

class TeamUpdate(BaseModel):
    name: str | None = None
    description: str | None = None

class TeamResponse(BaseModel):
    id: int
    organization_id: int
    name: str
    description: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class TeamMemberResponse(BaseModel):
    id: int
    team_id: int
    user_id: int
    role: str
    joined_at: datetime
    user: UserResponse | None = None

    class Config:
        from_attributes = True


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AttachmentResponse(BaseModel):
    id: int
    task_id: int
    file_name: str
    file_path: str
    file_type: str | None
    uploaded_at: datetime

    class Config:
        from_attributes = True
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
import os
import shutil
from datetime import datetime
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db, get_current_user
from app.schemas import TaskCreate, TaskUpdate, TaskResponse, AttachmentResponse
from app import models, schemas
from app.routers.websocket import manager
from app.services.task_service import TaskService
from app.services.kanban_service import KanbanService

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)

# 🟢 CREATE TASK
@router.post("/", response_model=TaskResponse)
def create_task(
    task: TaskCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    service = TaskService(db)
    try:
        new_task = service.create_task(task.model_dump(exclude_unset=True), user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    background_tasks.add_task(manager.broadcast, {
        "event": "task_created",
        "task_id": new_task.id,
        "title": new_task.title
    })
    return new_task

# 🟢 GET ALL TASKS
@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    service = TaskService(db)
    return service.get_tasks_for_user(user)

# 🟢 GET SINGLE TASK
@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    service = TaskService(db)
    task = service.get_task(task_id, user)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

# 🟡 UPDATE TASK
@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    data: TaskUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    service = TaskService(db)
    updated_task = service.update_task(task_id, data.model_dump(exclude_unset=True), user)

    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")

    background_tasks.add_task(manager.broadcast, {
        "event": "task_updated",
        "task_id": updated_task.id,
        "title": updated_task.title
    })

    return updated_task

# 🔴 DELETE TASK
@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    service = TaskService(db)
    deleted = service.delete_task(task_id, user)

    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found")

    background_tasks.add_task(manager.broadcast, {
        "event": "task_deleted",
        "task_id": task_id
    })

    return {"message": "Task deleted successfully"}

# 🟢 ARCHIVE TASK
@router.post("/{task_id}/archive", response_model=TaskResponse)
def archive_task(
    task_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    service = TaskService(db)
    task = service.archive_task(task_id, user)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

# 🟢 RESTORE TASK
@router.post("/{task_id}/restore", response_model=TaskResponse)
def restore_task(
    task_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    service = TaskService(db)
    task = service.restore_task(task_id, user)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

# 🟢 DUPLICATE TASK
@router.post("/{task_id}/duplicate", response_model=TaskResponse)
def duplicate_task(
    task_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    service = TaskService(db)
    task = service.duplicate_task(task_id, user)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    background_tasks.add_task(manager.broadcast, {
        "event": "task_created",
        "task_id": task.id,
        "title": task.title
    })
    return task

# 🟢 KANBAN REORDER / MOVE
@router.patch("/{task_id}/move", response_model=TaskResponse)
def move_task(
    task_id: int,
    new_status: str,
    new_position: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    service = KanbanService(db)
    task = service.move_task(task_id, new_status, new_position, user)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    background_tasks.add_task(manager.broadcast, {
        "event": "task_moved",
        "task_id": task.id,
        "status": new_status,
        "position": new_position
    })
    return task

@router.patch("/kanban/reorder")
def reorder_tasks(
    task_updates: List[dict], # List of {"id": int, "position": int}
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    service = KanbanService(db)
    service.reorder_tasks(task_updates, user)
    
    background_tasks.add_task(manager.broadcast, {
        "event": "tasks_reordered"
    })
    return {"message": "Tasks reordered"}

# 🟢 GET ASSIGNED TO ME
@router.get("/assigned/me", response_model=List[TaskResponse])
def get_assigned_tasks(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(models.Task).filter(models.Task.assigned_to == user.id).all()

# 🟡 ASSIGN TASK
@router.put("/{task_id}/assign", response_model=TaskResponse)
def assign_task(
    task_id: int,
    user_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    service = TaskService(db)
    task = service.get_task(task_id, current_user)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    task = service.update_task(task_id, {
        "assigned_to": user_id,
        "assigned_by": current_user.id,
        "assigned_at": datetime.utcnow()
    }, current_user)
    
    # Also create a notification
    notif = models.Notification(
        user_id=user_id,
        title="Task Assigned",
        message=f"You have been assigned to task: {task.title}",
        type="assignment"
    )
    db.add(notif)
    db.commit()
    
    background_tasks.add_task(manager.broadcast, {
        "event": "task_assigned",
        "task_id": task.id,
        "assigned_to": user_id
    })
    
    return task

# 🟢 UPLOAD ATTACHMENT
@router.post("/{task_id}/attachments", response_model=AttachmentResponse)
def upload_attachment(
    task_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    service = TaskService(db)
    task = service.get_task(task_id, current_user)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    file_path = os.path.join(UPLOAD_DIR, f"{task_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    db_attachment = models.Attachment(
        task_id=task_id,
        file_name=file.filename,
        file_path=file_path,
        file_type=file.content_type
    )
    db.add(db_attachment)
    db.commit()
    db.refresh(db_attachment)
    return db_attachment

# 🟢 GET ATTACHMENTS
@router.get("/{task_id}/attachments", response_model=List[AttachmentResponse])
def get_task_attachments(
    task_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    service = TaskService(db)
    task = service.get_task(task_id, current_user)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    attachments = db.query(models.Attachment).filter(models.Attachment.task_id == task_id).all()
    return attachments

# 🔴 DELETE ATTACHMENT
@router.delete("/attachments/{attachment_id}")
def delete_attachment(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    attachment = db.query(models.Attachment).filter(models.Attachment.id == attachment_id).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
        
    # verify user has access to task
    service = TaskService(db)
    task = service.get_task(attachment.task_id, current_user)
    if not task:
        raise HTTPException(status_code=403, detail="Not authorized to delete this attachment")
        
    if os.path.exists(attachment.file_path):
        os.remove(attachment.file_path)
        
    db.delete(attachment)
    db.commit()
    return {"message": "Attachment deleted successfully"}

class CommentCreate(schemas.BaseModel):
    content: str

@router.post("/{task_id}/comments")
def add_comment(task_id: int, comment: CommentCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    service = TaskService(db)
    task = service.get_task(task_id, current_user)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    new_comment = models.TaskComment(task_id=task_id, user_id=current_user.id, content=comment.content)
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return {"message": "Comment added", "comment_id": new_comment.id}

@router.get("/{task_id}/comments")
def get_comments(task_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    service = TaskService(db)
    task = service.get_task(task_id, current_user)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    comments = db.query(models.TaskComment).filter(models.TaskComment.task_id == task_id).all()
    return comments

class LabelCreate(schemas.BaseModel):
    name: str
    color: str = "#000000"

@router.post("/{task_id}/labels")
def add_label_to_task(task_id: int, label: LabelCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    service = TaskService(db)
    task = service.get_task(task_id, current_user)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    db_label = db.query(models.Label).filter(models.Label.name == label.name).first()
    if not db_label:
        db_label = models.Label(name=label.name, color=label.color)
        db.add(db_label)
        db.commit()
        db.refresh(db_label)
        
    if db_label not in task.labels:
        task.labels.append(db_label)
        db.commit()
        
    return {"message": "Label added to task", "label": db_label.name}
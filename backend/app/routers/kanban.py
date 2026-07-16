from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models import User, Task
from pydantic import BaseModel

router = APIRouter(prefix="/kanban", tags=["Kanban Advanced"])

class MoveRequest(BaseModel):
    task_id: int
    source_status: str
    destination_status: str
    position: int

class ReorderRequest(BaseModel):
    task_id: int
    new_position: int
    status: str

@router.patch("/move")
def move_task(request: MoveRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == request.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.status = request.destination_status
    task.position = request.position
    db.commit()
    db.refresh(task)
    return {"message": "Task moved successfully", "task_id": task.id, "status": task.status}

@router.patch("/reorder")
def reorder_task(request: ReorderRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == request.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.position = request.new_position
    db.commit()
    db.refresh(task)
    return {"message": "Task reordered successfully", "task_id": task.id, "position": task.position}

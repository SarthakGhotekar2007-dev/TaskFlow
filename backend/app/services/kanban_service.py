from app.repositories.task_repository import TaskRepository
from app.models import User, Task
from sqlalchemy.orm import Session
from app.services.activity_service import log_activity
from sqlalchemy import asc

class KanbanService:
    def __init__(self, db: Session):
        self.repository = TaskRepository(db)
        self.db = db

    def move_task(self, task_id: int, new_status: str, new_position: int, user: User):
        """Moves a task to a new status (column) and optionally sets position"""
        task = self.repository.get_task_by_id(task_id)
        if not task:
            return None
            
        old_status = task.status
        task.status = new_status
        task.position = new_position
        
        self.db.commit()
        self.db.refresh(task)
        
        if old_status != new_status:
            log_activity(self.db, user.id, f"Moved task to {new_status}", task.title, task.id)
            
        return task

    def reorder_tasks(self, task_updates: list[dict], user: User):
        """Bulk updates task positions in a column"""
        # task_updates is a list of {"id": int, "position": int}
        updated_tasks = []
        for update in task_updates:
            task = self.repository.get_task_by_id(update["id"])
            if task:
                task.position = update["position"]
                updated_tasks.append(task)
                
        self.db.commit()
        return updated_tasks

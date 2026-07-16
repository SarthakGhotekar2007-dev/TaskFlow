from app.repositories.task_repository import TaskRepository
from app.services.activity_service import log_activity
from app.models import User
from sqlalchemy.orm import Session

class TaskService:
    def __init__(self, db: Session):
        self.repository = TaskRepository(db)
        self.db = db

    def get_tasks_for_user(self, user: User):
        return self.repository.get_tasks_for_user(user.id, getattr(user, 'role', 'user'))

    def get_task(self, task_id: int, user: User):
        # We can add RBAC check here for specific task
        task = self.repository.get_task_by_id(task_id)
        return task

    def create_task(self, task_data: dict, user: User):
        # Additional business logic: setting default position, validation, etc.
        # Check if parent_id exists
        if task_data.get('parent_id'):
            parent = self.repository.get_task_by_id(task_data['parent_id'])
            if not parent:
                raise ValueError("Parent task not found")

        task = self.repository.create_task(task_data, user.id)
        log_activity(self.db, user.id, "Task Created", task.title, task.id)
        return task

    def update_task(self, task_id: int, task_data: dict, user: User):
        task = self.repository.update_task(task_id, task_data)
        if not task:
            return None
            
        action = "Task Updated"
        if 'status' in task_data:
            action = f"Task Status Changed to {task_data['status']}"
            
        log_activity(self.db, user.id, action, task.title, task.id)
        return task

    def delete_task(self, task_id: int, user: User):
        task = self.repository.get_task_by_id(task_id)
        if not task:
            return False
            
        title = task.title
        deleted = self.repository.delete_task(task_id)
        if deleted:
            log_activity(self.db, user.id, "Task Deleted", title, task_id)
        return deleted

    def archive_task(self, task_id: int, user: User):
        return self.update_task(task_id, {"archived": True}, user)

    def restore_task(self, task_id: int, user: User):
        return self.update_task(task_id, {"archived": False}, user)

    def duplicate_task(self, task_id: int, user: User):
        task = self.repository.get_task_by_id(task_id)
        if not task:
            return None
        
        task_data = {
            "title": f"Copy of {task.title}",
            "description": task.description,
            "status": task.status,
            "priority": task.priority,
            "due_date": task.due_date,
            "category": task.category,
            "organization_id": task.organization_id,
            "team_id": task.team_id,
        }
        return self.create_task(task_data, user)

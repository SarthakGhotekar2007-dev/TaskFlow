from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models import Task, TaskComment, Label

class TaskRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_task_by_id(self, task_id: int):
        return self.db.query(Task).filter(Task.id == task_id).first()

    def get_tasks_for_user(self, user_id: int, user_role: str = "user"):
        if user_role in ["admin", "manager"]:
            return self.db.query(Task).filter(Task.archived == False).all()
        return self.db.query(Task).filter(
            Task.archived == False,
            or_(Task.user_id == user_id, Task.assigned_to == user_id)
        ).all()

    def create_task(self, task_data: dict, user_id: int):
        task = Task(**task_data, user_id=user_id)
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def update_task(self, task_id: int, update_data: dict):
        task = self.get_task_by_id(task_id)
        if not task:
            return None
        
        for key, value in update_data.items():
            setattr(task, key, value)
            
        self.db.commit()
        self.db.refresh(task)
        return task

    def delete_task(self, task_id: int):
        task = self.get_task_by_id(task_id)
        if task:
            self.db.delete(task)
            self.db.commit()
            return True
        return False
        
    def get_subtasks(self, parent_id: int):
        return self.db.query(Task).filter(Task.parent_id == parent_id).all()

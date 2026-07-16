from sqlalchemy.orm import Session
from app import models
from app.schemas import TaskCreate, TaskUpdate
from app.services.activity_service import log_activity

# CREATE TASK
def create_task(db: Session, task: TaskCreate, user_id: int):
    db_task = models.Task(
        title=task.title,
        description=task.description,
        priority=task.priority,
        due_date=task.due_date,
        category=task.category,
        notes=task.notes,
        recurrence=task.recurrence,
        attachments=task.attachments,
        assigned_to=task.assigned_to,
        user_id=user_id
    )

    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    log_activity(db, user_id, "Task Created", task.title, db_task.id)
    
    return db_task


# GET ALL TASKS
def get_tasks(db: Session, user_id: int, user_role: str = "user"):
    if user_role == "admin" or user_role == "manager":
        # RBAC: Admin and Manager can view all team tasks. For this MVP, let's return all tasks in the DB.
        # Alternatively, wait, manager only views team tasks. We assume all tasks are team tasks for now unless specified.
        # Let's preserve old logic for regular users, and allow admin/manager to see all tasks.
        return db.query(models.Task).all()
    from sqlalchemy import or_
    return db.query(models.Task).filter(
        or_(models.Task.user_id == user_id, models.Task.assigned_to == user_id)
    ).all()



# GET SINGLE TASK
def get_task(db: Session, task_id: int, user_id: int, user_role: str = "user"):
    if user_role == "admin" or user_role == "manager":
        return db.query(models.Task).filter(models.Task.id == task_id).first()
    from sqlalchemy import or_
    return db.query(models.Task).filter(
        models.Task.id == task_id,
        or_(models.Task.user_id == user_id, models.Task.assigned_to == user_id)
    ).first()



# UPDATE TASK
def update_task(db: Session, task_id: int, data: TaskUpdate, user_id: int, user_role: str = "user"):
    task = get_task(db, task_id, user_id, user_role)

    if not task:
        return None

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)
    
    if data.completed is not None and data.completed:
        log_activity(db, user_id, "Task Completed", task.title, task.id)
    else:
        log_activity(db, user_id, "Task Updated", task.title, task.id)
        
    return task


# DELETE TASK
def delete_task(db: Session, task_id: int, user_id: int, user_role: str = "user"):
    task = get_task(db, task_id, user_id, user_role)

    if not task:
        return False

    title = task.title
    db.delete(task)
    db.commit()
    
    log_activity(db, user_id, "Task Deleted", title, task_id)
    
    return True

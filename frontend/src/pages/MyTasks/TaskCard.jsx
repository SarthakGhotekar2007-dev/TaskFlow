import React, { memo } from 'react';
import { FiCheckCircle, FiEdit2, FiTrash2, FiCalendar, FiUser } from 'react-icons/fi';

const TaskCard = memo(({ 
  task, 
  isSelected, 
  onSelect, 
  onToggleComplete, 
  onEdit, 
  onDeleteClick, 
  onCardClick, 
  getAssigneeName, 
  isProcessing 
}) => {
  const getAssigneeInitials = (name) => {
    if (!name || name === 'Unassigned') return <FiUser />;
    return name.charAt(0).toUpperCase();
  };
  
  const handleToggle = (e) => {
    e.stopPropagation();
    onToggleComplete(task);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(task);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDeleteClick(task);
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onSelect(task.id);
  };

  const isCompleted = task.completed;
  
  return (
    <div 
      className={`task-card ${isSelected ? 'selected' : ''}`} 
      onClick={() => onCardClick(task)} 
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if(e.key === 'Enter') onCardClick(task); }}
      aria-label={`View details for task: ${task.title}`}
    >
      <div className="task-card-header">
        <div className="task-title-group">
          <div 
            className={`task-checkbox-wrapper ${isSelected ? 'checked' : ''}`} 
            onClick={handleCheckboxClick}
            role="checkbox"
            aria-checked={isSelected}
            tabIndex={0}
            onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(task.id); } }}
          >
            <input type="checkbox" className="task-checkbox" checked={isSelected} readOnly tabIndex={-1} />
          </div>
          <button 
            className={`status-circle ${isCompleted ? 'completed' : ''}`}
            onClick={handleToggle}
            title={isCompleted ? "Mark pending" : "Mark complete"}
            aria-label={isCompleted ? "Mark as pending" : "Mark as complete"}
            disabled={isProcessing}
          >
            {isCompleted ? <FiCheckCircle /> : <div className="empty-circle" />}
          </button>
          <h4 className="task-title-text" style={{ textDecoration: isCompleted ? 'line-through' : 'none', opacity: isCompleted ? 0.6 : 1 }}>
            {task.title}
          </h4>
        </div>
        <div className="task-actions">
          <button 
            className="icon-btn-small" 
            title="Edit Task" 
            onClick={handleEdit} 
            disabled={isProcessing}
            aria-label="Edit task"
          >
            <FiEdit2 />
          </button>
          <button 
            className="icon-btn-small delete" 
            title="Delete Task" 
            onClick={handleDelete} 
            disabled={isProcessing}
            aria-label="Delete task"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
      
      {task.description && (
        <p className="task-card-desc">{task.description}</p>
      )}

      <div className="task-card-footer">
        <div className="task-badges">
          <span className={`badge status-badge ${isCompleted ? 'completed' : 'pending'}`}>
            {isCompleted ? 'Completed' : 'Pending'}
          </span>
          {task.archived && (
            <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              Archived
            </span>
          )}
          <span className={`badge priority-${task.priority?.toLowerCase()}`}>{task.priority}</span>
          {task.category && <span className="badge category-badge">{task.category}</span>}
        </div>
        
        <div className="task-meta-right">
          {task.due_date && (
            <span className="due-date-badge">
              <FiCalendar aria-hidden="true" /> 
              {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
          <div className="assignee-avatar" title={`Assigned to: ${getAssigneeName(task.assigned_to)}`}>
            {getAssigneeInitials(getAssigneeName(task.assigned_to))}
          </div>
        </div>
      </div>
    </div>
  );
});

TaskCard.displayName = 'TaskCard';

export default TaskCard;

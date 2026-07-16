import React from 'react';
import './MyTasks.css'; // Relies on skeleton styles we will add

const TaskSkeleton = () => {
  return (
    <div className="task-card skeleton-card" aria-hidden="true">
      <div className="task-card-header">
        <div className="task-title-group">
          <div className="skeleton-checkbox"></div>
          <div className="skeleton-circle"></div>
          <div className="skeleton-line title-line"></div>
        </div>
      </div>
      <div className="skeleton-line desc-line"></div>
      <div className="skeleton-line desc-line short"></div>
      <div className="task-card-footer">
        <div className="task-badges">
          <div className="skeleton-badge"></div>
          <div className="skeleton-badge"></div>
        </div>
        <div className="task-meta-right">
          <div className="skeleton-badge due"></div>
          <div className="skeleton-avatar"></div>
        </div>
      </div>
    </div>
  );
};

export default TaskSkeleton;

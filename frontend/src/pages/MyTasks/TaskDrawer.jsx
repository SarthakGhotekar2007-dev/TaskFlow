import React, { useState, useEffect } from 'react';
import { FiX, FiCheckCircle, FiPaperclip, FiDownload, FiActivity, FiUser, FiEdit2, FiTrash2, FiCopy, FiArchive, FiSend } from 'react-icons/fi';
import taskService from '../../services/taskService';
import { toast } from 'react-toastify';
import './TaskDrawer.css';

const TaskDrawer = ({ task, onClose, onUpdate, onDelete, onEdit }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      loadTaskData();
    }
  }, [task]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const loadTaskData = async () => {
    setLoading(true);
    try {
      const [comms, atts, hist] = await Promise.all([
        taskService.getComments(task.id).catch(() => []),
        taskService.getAttachments(task.id).catch(() => []),
        taskService.getActivityHistory().catch(() => [])
      ]);
      setComments(comms || []);
      setAttachments(atts || []);
      // Filter global history for this task
      const taskHist = (hist || []).filter(h => h.task_id === task.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setActivities(taskHist);
    } catch (err) {
      console.error('Failed to load task specific data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await taskService.addComment(task.id, newComment);
      setNewComment('');
      loadTaskData(); // refresh comments
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  const handleToggleComplete = async () => {
    try {
      await taskService.updateTask(task.id, { completed: !task.completed });
      toast.success(task.completed ? 'Task reopened' : 'Task completed');
      onUpdate();
      onClose();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleArchive = async () => {
    try {
      await taskService.archiveTask(task.id);
      toast.success('Task archived');
      onUpdate();
      onClose();
    } catch (err) {
      toast.error('Failed to archive task');
    }
  };

  const handleRestore = async () => {
    try {
      await taskService.restoreTask(task.id);
      toast.success('Task restored');
      onUpdate();
      onClose();
    } catch (err) {
      toast.error('Failed to restore task');
    }
  };

  const handleDuplicate = async () => {
    try {
      const newDpt = await taskService.duplicateTask(task.id);
      toast.success('Task duplicated');
      onUpdate();
      onEdit(newDpt);
    } catch (err) {
      toast.error('Failed to duplicate task');
    }
  };

  if (!task) return null;

  return (
    <div className="drawer-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="task-drawer glass animate-slide-in-right" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-area">
            <span className="task-id-badge">TASK-{task.id}</span>
            <h3 className="drawer-task-title">{task.title}</h3>
          </div>
          <button className="icon-btn-small close-btn" onClick={onClose} aria-label="Close details">
            <FiX />
          </button>
        </div>

        <div className="drawer-tabs">
          <button className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Details</button>
          <button className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>Comments ({comments.length})</button>
          <button className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>Activity</button>
        </div>

        <div className="drawer-body">
          {loading && <div className="loading-state">Loading details...</div>}
          
          {!loading && activeTab === 'details' && (
            <div className="drawer-section animate-fade-in">
              <div className="task-properties">
                {task.archived && (
                  <div className="property-row" style={{ gridColumn: 'span 2' }}>
                    <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '6px 12px', width: 'fit-content' }}>
                      Archived
                    </span>
                  </div>
                )}
                <div className="property-row">
                  <span className="property-label">Status</span>
                  <span className={`badge status-badge ${task.completed ? 'completed' : 'pending'}`}>{task.completed ? 'Completed' : 'Pending'}</span>
                </div>
                <div className="property-row">
                  <span className="property-label">Priority</span>
                  <span className={`badge priority-${task.priority?.toLowerCase()}`}>{task.priority}</span>
                </div>
                <div className="property-row">
                  <span className="property-label">Due Date</span>
                  <span className="property-value">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date set'}</span>
                </div>
                <div className="property-row">
                  <span className="property-label">Created At</span>
                  <span className="property-value">{new Date(task.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="info-block">
                <h4>Description</h4>
                <div className="task-description-full">
                  {task.description ? <p>{task.description}</p> : <p className="empty-text">No description provided.</p>}
                </div>
              </div>

              <div className="info-block">
                <h4>Tags</h4>
                <div className="task-badges" style={{ marginTop: '8px' }}>
                  {task.category && <span className="badge category-badge">{task.category}</span>}
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#ccc' }}>Frontend</span>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#ccc' }}>UI/UX</span>
                </div>
              </div>

              <div className="info-block">
                <h4>Checklist <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal', float: 'right' }}>0% Completed</span></h4>
                <div className="checklist-empty">
                  <FiCheckCircle style={{ opacity: 0.5, fontSize: '1.2rem', marginBottom: '8px' }} />
                  <p>No checklist items found for this task.</p>
                </div>
              </div>

              <div className="info-block">
                <h4>Attachments ({attachments.length})</h4>
                {attachments.length === 0 ? (
                  <div className="attachments-empty">
                    <FiPaperclip style={{ opacity: 0.5, fontSize: '1.2rem', marginBottom: '8px' }} />
                    <p>No attachments found.</p>
                  </div>
                ) : (
                  <ul className="attachment-list">
                    {attachments.map(att => (
                      <li key={att.id} className="attachment-item">
                        <div className="attachment-info">
                          <FiPaperclip />
                          <span>{att.file_name}</span>
                        </div>
                        <a href={`http://localhost:8000/${att.file_path}`} target="_blank" rel="noopener noreferrer" className="icon-btn-small"><FiDownload /></a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {!loading && activeTab === 'comments' && (
            <div className="drawer-section animate-fade-in comments-section">
              <div className="comments-list">
                {comments.length === 0 ? (
                  <p className="empty-text" style={{ textAlign: 'center', marginTop: '40px' }}>No comments yet. Be the first to comment!</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="comment-item">
                      <div className="comment-avatar"><FiUser /></div>
                      <div className="comment-content-area">
                        <div className="comment-header">
                          <strong>User {c.user_id}</strong>
                          <span className="comment-time">{new Date(c.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>
                        </div>
                        <p className="comment-text">{c.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <form className="comment-form" onSubmit={handleAddComment}>
                <input 
                  type="text" 
                  placeholder="Write a comment..." 
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                />
                <button type="submit" className="btn-primary send-btn" disabled={!newComment.trim()}><FiSend /></button>
              </form>
            </div>
          )}

          {!loading && activeTab === 'activity' && (
            <div className="drawer-section animate-fade-in">
              {activities.length === 0 ? (
                <p className="empty-text" style={{ textAlign: 'center', marginTop: '40px' }}>No activity recorded for this task yet.</p>
              ) : (
                <div className="activity-timeline">
                  {activities.map((act, index) => (
                    <div key={act.id} className="timeline-item">
                      <div className="timeline-icon"><FiActivity /></div>
                      <div className="timeline-content">
                        <p><strong>{act.action}</strong>: {act.description}</p>
                        <span className="timeline-time">{new Date(act.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="drawer-footer">
          <div className="quick-actions">
            <button className="action-btn" title="Edit Task" onClick={() => onEdit(task)}><FiEdit2 /> <span>Edit</span></button>
            <button className="action-btn" title={task.completed ? "Reopen" : "Mark Complete"} onClick={handleToggleComplete}>
              <FiCheckCircle /> <span>{task.completed ? 'Reopen' : 'Complete'}</span>
            </button>
            <button className="action-btn" title="Duplicate Task" onClick={handleDuplicate}><FiCopy /> <span>Duplicate</span></button>
            {task.archived ? (
              <button className="action-btn" title="Restore Task" onClick={handleRestore} style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}><FiArchive /> <span>Restore</span></button>
            ) : (
              <button className="action-btn" title="Archive Task" onClick={handleArchive}><FiArchive /> <span>Archive</span></button>
            )}
            <button className="action-btn delete" title="Delete Task" onClick={() => onDelete(task)}><FiTrash2 /> <span>Delete</span></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDrawer;

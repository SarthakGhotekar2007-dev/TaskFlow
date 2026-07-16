import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import taskService from '../../services/taskService';
import userService from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';
import TaskDrawer from './TaskDrawer';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import BulkActionToolbar from './BulkActionToolbar';
import TaskSearch from './TaskSearch';
import TaskFilters from './TaskFilters';
import FilterChips from './FilterChips';
import SortDropdown from './SortDropdown';
import TaskCard from './TaskCard';
import TaskSkeleton from './TaskSkeleton';
import { getDisplayName } from '../../utils/userUtils';
import './MyTasks.css';

const MyTasks = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Selection & Bulk State
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Search, Filter & Sort State (Persisted)
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem('myTasks_search') || '');
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem('myTasks_filters');
    return saved ? JSON.parse(saved) : {
      priority: [],
      status: [],
      dueDate: [],
      assignee: 'Everyone',
      tags: []
    };
  });
  const [sortBy, setSortBy] = useState(() => localStorage.getItem('myTasks_sort') || 'Newest');

  // Persist state changes
  useEffect(() => {
    localStorage.setItem('myTasks_search', searchTerm);
    localStorage.setItem('myTasks_filters', JSON.stringify(filters));
    localStorage.setItem('myTasks_sort', sortBy);
  }, [searchTerm, filters, sortBy]);
  
  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', priority: 'Low', due_date: '', category: 'General', assigned_to: ''
  });
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const [tasksData, usersData] = await Promise.all([
        taskService.getTasks(),
        userService.getUsers()
      ]);
      setTasks(tasksData);
      setUsers(usersData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const handleRefresh = () => fetchTasks();
    window.addEventListener('refresh-tasks', handleRefresh);
    return () => window.removeEventListener('refresh-tasks', handleRefresh);
  }, []);

  const fetchAttachments = async (taskId) => {
    try {
      const data = await taskService.getAttachments(taskId);
      setAttachments(data);
    } catch (err) {
      console.error('Failed to load attachments');
    }
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
  };

  const confirmDelete = async (id) => {
    try {
      setIsProcessing(true);
      await taskService.deleteTask(id);
      toast.success("Task Deleted Successfully");
      setTaskToDelete(null);
      setSelectedTasks(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      fetchTasks();
    } catch (error) {
      toast.error("Failed to delete task");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleTaskSelection = (id) => {
    setSelectedTasks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkComplete = async () => {
    if (selectedTasks.size === 0) return;
    setIsProcessing(true);
    try {
      await Promise.all(Array.from(selectedTasks).map(id => taskService.updateTask(id, { completed: true })));
      toast.success(`${selectedTasks.size} tasks marked as complete`);
      setSelectedTasks(new Set());
      fetchTasks();
    } catch (err) {
      toast.error("Failed to complete some tasks");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedTasks.size === 0) return;
    setIsProcessing(true);
    try {
      await Promise.all(Array.from(selectedTasks).map(id => taskService.archiveTask(id)));
      toast.success(`${selectedTasks.size} tasks archived`);
      setSelectedTasks(new Set());
      fetchTasks();
    } catch (err) {
      toast.error("Failed to archive some tasks");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedTasks.size} tasks?`)) return;
    setIsProcessing(true);
    try {
      await Promise.all(Array.from(selectedTasks).map(id => taskService.deleteTask(id)));
      toast.success(`${selectedTasks.size} tasks deleted`);
      setSelectedTasks(new Set());
      fetchTasks();
    } catch (err) {
      toast.error("Failed to delete some tasks");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      await taskService.updateTask(task.id, { completed: !task.completed });
      toast.success(`Task ${!task.completed ? 'Completed' : 'Reopened'} Successfully`);
      fetchTasks();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleOpenModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority || 'Low',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        category: task.category || 'General',
        assigned_to: task.assigned_to || ''
      });
      fetchAttachments(task.id);
    } else {
      setEditingTask(null);
      setFormData({ title: '', description: '', priority: 'Low', due_date: '', category: 'General', assigned_to: '' });
      setAttachments([]);
    }
    setShowModal(true);
  };

  useEffect(() => {
    if (location.state?.openModal) {
      handleOpenModal();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null
      };

      if (editingTask) {
        await taskService.updateTask(editingTask.id, payload);
        toast.success("Task Updated Successfully");
      } else {
        await taskService.createTask(payload);
        toast.success("Task Created Successfully");
      }
      setShowModal(false);
      fetchTasks();
    } catch (error) {
      toast.error(editingTask ? "Failed to update task" : "Failed to create task");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !editingTask) return;
    try {
      setUploading(true);
      await taskService.uploadAttachment(editingTask.id, file);
      toast.success('File uploaded');
      fetchAttachments(editingTask.id);
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      e.target.value = null; // reset input
    }
  };

  const handleDeleteAttachment = async (id) => {
    if (!window.confirm("Delete this attachment?")) return;
    try {
      await taskService.deleteAttachment(id);
      toast.success('Attachment deleted');
      fetchAttachments(editingTask.id);
    } catch (error) {
      toast.error('Failed to delete attachment');
    }
  };

  const getAssignedUserName = (id) => {
    const u = users.find(u => u.id === id);
    return u ? getDisplayName(u) : 'Unassigned';
  };

  // Search, Filter and Sort Logic
  const filteredTasks = React.useMemo(() => {
    return tasks.filter(task => {
      // 1. Search
      const searchLower = searchTerm.toLowerCase();
      const assigneeName = getAssignedUserName(task.assigned_to).toLowerCase();
      const tagsString = task.category ? task.category.toLowerCase() : '';
      const matchesSearch = !searchTerm || 
        task.title.toLowerCase().includes(searchLower) || 
        (task.description && task.description.toLowerCase().includes(searchLower)) ||
        tagsString.includes(searchLower) ||
        assigneeName.includes(searchLower);

      // 2. Priority
      const matchesPriority = filters.priority.length === 0 || filters.priority.includes(task.priority);
      
      // 3. Status
      let matchesStatus = true;
      if (filters.status.length > 0) {
        matchesStatus = false;
        if (filters.status.includes('Completed') && task.completed) matchesStatus = true;
        if (filters.status.includes('Archived') && task.archived) matchesStatus = true;
        if (filters.status.includes('Pending') && !task.completed && task.status === 'Todo') matchesStatus = true;
        if (filters.status.includes('In Progress') && task.status === 'In Progress') matchesStatus = true;
        if (filters.status.includes('Review') && task.status === 'Review') matchesStatus = true;
      } else {
        // Default: don't show archived unless specifically requested
        if (task.archived) matchesStatus = false;
      }

      // 4. Due Date
      let matchesDue = true;
      if (filters.dueDate.length > 0) {
        matchesDue = false;
        const today = new Date();
        today.setHours(0,0,0,0);
        const taskDue = task.due_date ? new Date(task.due_date) : null;
        if (taskDue) {
          taskDue.setHours(0,0,0,0);
          const diffDays = Math.round((taskDue - today) / (1000 * 60 * 60 * 24));
          
          if (filters.dueDate.includes('Today') && diffDays === 0) matchesDue = true;
          if (filters.dueDate.includes('Tomorrow') && diffDays === 1) matchesDue = true;
          if (filters.dueDate.includes('This Week') && diffDays >= 0 && diffDays <= 7) matchesDue = true;
          if (filters.dueDate.includes('This Month') && taskDue.getMonth() === today.getMonth() && taskDue.getFullYear() === today.getFullYear()) matchesDue = true;
          if (filters.dueDate.includes('Overdue') && diffDays < 0 && !task.completed) matchesDue = true;
        }
      }

      // 5. Assignee
      let matchesAssignee = true;
      if (filters.assignee && filters.assignee !== 'Everyone') {
        if (filters.assignee === 'Me') matchesAssignee = task.assigned_to === user?.id;
        if (filters.assignee === 'Team Member') matchesAssignee = task.assigned_to !== user?.id && task.assigned_to !== null;
      }

      // 6. Tags
      const matchesTags = filters.tags.length === 0 || (task.category && filters.tags.includes(task.category));

      return matchesSearch && matchesPriority && matchesStatus && matchesDue && matchesAssignee && matchesTags;

    }).sort((a, b) => {
      if (sortBy === 'Newest') return new Date(b.created_at || b.id) - new Date(a.created_at || a.id);
      if (sortBy === 'Oldest') return new Date(a.created_at || a.id) - new Date(b.created_at || b.id);
      if (sortBy === 'Recently Updated') return new Date(b.updated_at || b.id) - new Date(a.updated_at || a.id);
      if (sortBy === 'Alphabetical (A-Z)') return a.title.localeCompare(b.title);
      if (sortBy === 'Alphabetical (Z-A)') return b.title.localeCompare(a.title);
      if (sortBy === 'Priority') {
        const pMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
      }
      if (sortBy === 'Due Date') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      }
      return 0;
    });
  }, [tasks, searchTerm, filters, sortBy, users, user]);

  const handleRemoveFilter = (category, value) => {
    if (category === 'assignee') {
      setFilters({ ...filters, assignee: 'Everyone' });
    } else {
      setFilters({ ...filters, [category]: filters[category].filter(v => v !== value) });
    }
  };

  // Get available tags from tasks for filter dropdown
  const availableTags = React.useMemo(() => {
    const tags = new Set();
    tasks.forEach(t => t.category && tags.add(t.category));
    return Array.from(tags);
  }, [tasks]);

  const canAssign = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="my-tasks-page page-content">
      <header className="tasks-header animate-slide-up">
        <div className="header-titles">
          <h2>My Tasks <span className="task-count">{filteredTasks.length}</span></h2>
          <p>Manage, prioritize, and track your ongoing work efficiently.</p>
        </div>
        <button className="btn-primary add-task-btn" onClick={() => handleOpenModal()}>
          <FiPlus />
          Create Task
        </button>
      </header>

      <section className="advanced-tasks-controls animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="controls-main-row">
          <TaskSearch initialSearch={searchTerm} onSearch={setSearchTerm} />
          <TaskFilters filters={filters} onFilterChange={setFilters} availableTags={availableTags} />
          <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
        </div>
        <FilterChips filters={filters} onRemoveFilter={handleRemoveFilter} />
      </section>

      <section className="tasks-list animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {loading ? (
          <>
            <TaskSkeleton />
            <TaskSkeleton />
            <TaskSkeleton />
          </>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <FiSearch style={{ fontSize: '2rem', marginBottom: '10px', opacity: 0.5 }} aria-hidden="true" />
            <p>No tasks found matching your criteria.</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              isSelected={selectedTasks.has(task.id)}
              onSelect={toggleTaskSelection}
              onToggleComplete={handleToggleComplete}
              onEdit={handleOpenModal}
              onDeleteClick={handleDeleteClick}
              onCardClick={setSelectedTask}
              getAssigneeName={getAssignedUserName}
              isProcessing={isProcessing}
            />
          ))
        )}
      </section>

      {/* Existing Modal form keeps the exact same functionality, but fits visually */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ width: '600px', maxWidth: '95%' }}>
            <div className="modal-header">
              <h2>{editingTask ? 'Edit Task' : 'Create Task'}</h2>
            </div>
            <form className="task-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Title</label>
                  <input required type="text" placeholder="e.g., Redesign landing page" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input required type="text" placeholder="e.g., Design, Engineering" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="3" placeholder="Add additional context or requirements..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Assign To</label>
                  <select 
                    value={formData.assigned_to} 
                    onChange={e => setFormData({...formData, assigned_to: e.target.value})}
                    disabled={!canAssign && formData.assigned_to !== '' && formData.assigned_to != user.id}
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{getDisplayName(u)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {editingTask && (
                <div className="attachments-section" style={{ marginTop: '15px', padding: '15px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0 }}><FiPaperclip /> Attachments</h4>
                    <label className="btn-secondary" style={{ cursor: 'pointer', padding: '5px 10px', fontSize: '0.8rem' }}>
                      <FiUpload /> {uploading ? 'Uploading...' : 'Upload'}
                      <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} disabled={uploading} />
                    </label>
                  </div>
                  {attachments.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', margin: 0 }}>No attachments yet.</p>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {attachments.map(att => (
                        <li key={att.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', padding: '5px 10px', borderRadius: '4px' }}>
                          <span>{att.file_name}</span>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <a href={`http://localhost:8000/${att.file_path}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}><FiDownload /></a>
                            <button type="button" onClick={() => handleDeleteAttachment(att.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}><FiTrash2 /></button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editingTask ? 'Update Task' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Drawer */}
      {selectedTask && (
        <TaskDrawer 
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={() => { fetchTasks(); }}
          onDelete={(taskObj) => { setSelectedTask(null); handleDeleteClick(taskObj); }}
          onEdit={(t) => { setSelectedTask(null); handleOpenModal(t); }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        task={taskToDelete}
        onConfirm={confirmDelete}
        onCancel={() => setTaskToDelete(null)}
        isDeleting={isProcessing}
      />

      {/* Bulk Action Toolbar */}
      <BulkActionToolbar
        selectedCount={selectedTasks.size}
        onClearSelection={() => setSelectedTasks(new Set())}
        onBulkComplete={handleBulkComplete}
        onBulkArchive={handleBulkArchive}
        onBulkDelete={handleBulkDelete}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default MyTasks;

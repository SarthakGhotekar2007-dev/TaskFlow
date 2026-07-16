import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'react-toastify';
import taskService from '../../services/taskService';
import './Kanban.css';

const Kanban = () => {
  const [data, setData] = useState({
    columns: {
      'todo': { id: 'todo', title: 'TODO', taskIds: [] },
      'completed': { id: 'completed', title: 'COMPLETED', taskIds: [] },
    },
    tasks: {},
    columnOrder: ['todo', 'completed']
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const tasksRes = await taskService.getTasks();
      
      const newTasks = {};
      const todoIds = [];
      const completedIds = [];

      tasksRes.forEach(task => {
        const taskId = `task-${task.id}`;
        newTasks[taskId] = { 
          id: taskId, 
          dbId: task.id, 
          content: task.title, 
          priority: task.priority || 'Low', 
          category: task.category || 'General',
          completed: task.completed
        };
        
        if (task.completed) {
          completedIds.push(taskId);
        } else {
          todoIds.push(taskId);
        }
      });

      setData({
        columns: {
          'todo': { id: 'todo', title: 'TODO', taskIds: todoIds },
          'completed': { id: 'completed', title: 'COMPLETED', taskIds: completedIds },
        },
        tasks: newTasks,
        columnOrder: ['todo', 'completed']
      });

    } catch (error) {
      toast.error('Failed to load Kanban tasks');
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const startColumn = data.columns[source.droppableId];
    const finishColumn = data.columns[destination.droppableId];

    // Optimistically update UI
    const startTaskIds = Array.from(startColumn.taskIds);
    startTaskIds.splice(source.index, 1);
    
    if (startColumn === finishColumn) {
      startTaskIds.splice(destination.index, 0, draggableId);
      const newColumn = { ...startColumn, taskIds: startTaskIds };
      setData({
        ...data,
        columns: { ...data.columns, [newColumn.id]: newColumn }
      });
      return;
    }

    const finishTaskIds = Array.from(finishColumn.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    
    setData({
      ...data,
      columns: {
        ...data.columns,
        [startColumn.id]: { ...startColumn, taskIds: startTaskIds },
        [finishColumn.id]: { ...finishColumn, taskIds: finishTaskIds },
      }
    });

    // Update Backend
    const task = data.tasks[draggableId];
    const isCompleted = destination.droppableId === 'completed';
    
    try {
      await taskService.updateTask(task.dbId, { completed: isCompleted });
      toast.success(`Task marked as ${isCompleted ? 'Completed' : 'TODO'}`);
    } catch (error) {
      toast.error('Failed to update task status');
      fetchTasks(); // Revert on failure
    }
  };

  if (loading) return <div className="page-content">Loading Kanban...</div>;

  return (
    <div className="kanban-page page-content">
      <div className="kanban-header animate-slide-up">
        <h2>Kanban Board</h2>
        <p>Drag and drop tasks to change their status.</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board-container animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const tasks = column.taskIds.map(taskId => data.tasks[taskId]);

            return (
              <div key={column.id} className="board-column glass">
                <h3 className="column-title">{column.title}</h3>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div 
                      className={`task-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              className={`task-card glass ${snapshot.isDragging ? 'dragging' : ''}`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <h4>{task.content}</h4>
                              <div className="task-badges">
                                <span className={`badge priority-${task.priority.toLowerCase()}`}>
                                  {task.priority}
                                </span>
                                <span className="badge category-badge">
                                  {task.category}
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Kanban;

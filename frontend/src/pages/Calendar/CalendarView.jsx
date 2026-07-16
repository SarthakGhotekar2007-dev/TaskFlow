import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import taskService from '../../services/taskService';
import { toast } from 'react-toastify';
import './CalendarView.css';

const CalendarView = () => {
  const [date, setDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const data = await taskService.getTasks();
        // Convert due_dates to Date objects
        const formattedTasks = data
          .filter(t => t.due_date)
          .map(t => ({
            ...t,
            date: new Date(t.due_date)
          }));
        setTasks(formattedTasks);
      } catch (error) {
        toast.error("Failed to load tasks for calendar");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayTasks = tasks.filter(t => t.date.toDateString() === date.toDateString());
      if (dayTasks.length > 0) {
        return (
          <div className="calendar-dots">
            {dayTasks.map((task, idx) => (
              <div key={idx} className={`dot dot-${task.priority?.toLowerCase() || 'low'}`}></div>
            ))}
          </div>
        );
      }
    }
    return null;
  };

  const selectedTasks = tasks.filter(t => t.date.toDateString() === date.toDateString());

  return (
    <div className="calendar-page page-content">
      <header className="calendar-header animate-slide-up">
        <h2>Calendar</h2>
        <p>Manage your schedule and due dates.</p>
      </header>

      <div className="calendar-layout animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="calendar-container glass">
          <Calendar 
            onChange={setDate} 
            value={date} 
            tileContent={tileContent}
            className="custom-calendar"
          />
        </div>
        
        <div className="calendar-sidebar glass">
          <h3>Tasks for {date.toDateString()}</h3>
          {loading ? (
            <p>Loading tasks...</p>
          ) : selectedTasks.length > 0 ? (
            <ul className="agenda-list">
              {selectedTasks.map((task, idx) => (
                <li key={idx} className="agenda-item">
                  <div className={`agenda-indicator priority-${task.priority?.toLowerCase() || 'low'}`}></div>
                  <div className="agenda-details">
                    <h4 style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</h4>
                    <span>{task.priority || 'Low'} Priority</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">No tasks scheduled for this day.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;

import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts';
import taskService from '../../services/taskService';
import { toast } from 'react-toastify';
import './Analytics.css';

const Analytics = () => {
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#22C55E', '#F59E0B', '#6366F1'];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [tasks, activity] = await Promise.all([
          taskService.getTasks(),
          taskService.getActivityHistory()
        ]);

        // Pie Data: Task Status
        const completed = tasks.filter(t => t.completed).length;
        const pending = tasks.length - completed;
        setPieData([
          { name: 'Completed', value: completed },
          { name: 'Pending', value: pending }
        ]);

        // Bar Data: Categories
        const categories = {};
        tasks.forEach(t => {
          const cat = t.category || 'General';
          categories[cat] = (categories[cat] || 0) + 1;
        });
        setBarData(Object.keys(categories).map(key => ({
          name: key,
          tasks: categories[key]
        })));

        // Line Data: Activity over the last 7 days
        const last7Days = Array.from({length: 7}).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toLocaleDateString('en-US', { weekday: 'short' });
        });

        const activityCount = {};
        last7Days.forEach(day => activityCount[day] = 0);

        activity.forEach(act => {
          const day = new Date(act.created_at).toLocaleDateString('en-US', { weekday: 'short' });
          if (activityCount[day] !== undefined) {
            activityCount[day] += 1;
          }
        });

        setLineData(last7Days.map(day => ({
          name: day,
          productivity: activityCount[day]
        })));

      } catch (error) {
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="page-content">Loading Analytics...</div>;

  return (
    <div className="analytics-page page-content">
      <header className="analytics-header animate-slide-up">
        <h2>Analytics Dashboard</h2>
        <p>Track your productivity and task distributions.</p>
      </header>

      <div className="charts-grid animate-slide-up" style={{ animationDelay: '0.1s' }}>
        
        {/* Task Status Pie Chart */}
        <div className="chart-card glass">
          <h3>Task Status</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Productivity Line Chart */}
        <div className="chart-card glass">
          <h3>Activity Trend (Last 7 Days)</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#64748B" />
                <YAxis stroke="#64748B" allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="productivity" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Bar Chart */}
        <div className="chart-card glass chart-full-width">
          <h3>Tasks by Category</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#64748B" />
                <YAxis stroke="#64748B" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="tasks" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;

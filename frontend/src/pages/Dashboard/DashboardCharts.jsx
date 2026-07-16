import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const data = [
  { name: 'Mon', completed: 4, new: 2 },
  { name: 'Tue', completed: 3, new: 1 },
  { name: 'Wed', completed: 5, new: 4 },
  { name: 'Thu', completed: 2, new: 1 },
  { name: 'Fri', completed: 6, new: 3 },
  { name: 'Sat', completed: 1, new: 0 },
  { name: 'Sun', completed: 0, new: 0 },
];

const DashboardCharts = () => {
  return (
    <div className="glass" style={{ padding: '20px', borderRadius: '16px', marginTop: '20px' }}>
      <h3 style={{ marginBottom: '20px' }}>Task Trends</h3>
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip />
            <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} />
            <Line type="monotone" dataKey="new" stroke="#3b82f6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardCharts;

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Mon', completed: 5 },
  { day: 'Tue', completed: 8 },
  { day: 'Wed', completed: 6 },
  { day: 'Thu', completed: 10 },
  { day: 'Fri', completed: 4 },
  { day: 'Sat', completed: 2 },
  { day: 'Sun', completed: 1 },
];

const WeeklyChart = () => {
  return (
    <div className="glass" style={{ padding: '20px', borderRadius: '16px' }}>
      <h3 style={{ marginBottom: '20px' }}>Weekly Progress</h3>
      <div style={{ height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="day" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip cursor={{ fill: 'rgba(99,102,241,0.1)' }} />
            <Bar dataKey="completed" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyChart;

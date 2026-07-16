import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Sarthak', tasks: 20 },
  { name: 'Alice', tasks: 15 },
  { name: 'Bob', tasks: 5 },
];

const TeamPerformanceChart = () => {
  return (
    <div className="glass" style={{ padding: '20px', borderRadius: '16px' }}>
      <h3 style={{ marginBottom: '20px' }}>Team Performance</h3>
      <div style={{ height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
            <XAxis type="number" stroke="#6b7280" />
            <YAxis dataKey="name" type="category" stroke="#6b7280" width={80} />
            <Tooltip cursor={{ fill: 'rgba(99,102,241,0.1)' }} />
            <Bar dataKey="tasks" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TeamPerformanceChart;

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Completed', value: 45 },
  { name: 'In Progress', value: 25 },
  { name: 'Todo', value: 20 },
  { name: 'Overdue', value: 10 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

const PieChartCard = () => {
  return (
    <div className="glass" style={{ padding: '20px', borderRadius: '16px' }}>
      <h3 style={{ marginBottom: '20px' }}>Task Distribution</h3>
      <div style={{ height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PieChartCard;

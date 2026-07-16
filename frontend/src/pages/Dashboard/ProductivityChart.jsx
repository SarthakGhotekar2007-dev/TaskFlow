import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { date: 'Jul 1', score: 60 },
  { date: 'Jul 2', score: 65 },
  { date: 'Jul 3', score: 62 },
  { date: 'Jul 4', score: 70 },
  { date: 'Jul 5', score: 75 },
  { date: 'Jul 6', score: 85 },
  { date: 'Jul 7', score: 82 },
];

const ProductivityChart = () => {
  return (
    <div className="glass" style={{ padding: '20px', borderRadius: '16px' }}>
      <h3 style={{ marginBottom: '20px' }}>Productivity Trend</h3>
      <div style={{ height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Area type="monotone" dataKey="score" stroke="#10b981" fillOpacity={1} fill="url(#colorScore)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProductivityChart;

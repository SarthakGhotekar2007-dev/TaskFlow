import React from 'react';
import { FiTrendingUp, FiAward } from 'react-icons/fi';

const WeeklySummaryCard = ({ data }) => {
  return (
    <div className="glass" style={{ padding: '20px', borderRadius: '16px', marginTop: '20px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.1) 100%)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <FiAward size={24} color="#6366f1" />
        <h3 style={{ margin: 0, color: '#4f46e5' }}>Weekly Insight</h3>
      </div>
      <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
        {data?.summary || "You completed 15 tasks this week! You are 20% more productive than last week."}
      </p>
      <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Most Productive</span>
          <p style={{ fontWeight: 'bold', margin: '4px 0 0 0' }}>{data?.most_productive_day || "Tuesday"}</p>
        </div>
        <div>
          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Trend</span>
          <p style={{ fontWeight: 'bold', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
            <FiTrendingUp /> +20%
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeeklySummaryCard;

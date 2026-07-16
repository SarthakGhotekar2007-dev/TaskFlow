import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import DashboardCharts from '../Dashboard/DashboardCharts';
import HeatMap from '../Dashboard/HeatMap';

const AnalyticsPage = () => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <header className="page-header">
          <h1>Analytics</h1>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <DashboardCharts />
          <HeatMap />
        </div>
        
        <div className="glass" style={{ padding: '24px', borderRadius: '16px', marginTop: '24px' }}>
          <h3>Team Performance Breakdown</h3>
          <p style={{ color: '#6b7280' }}>Data aggregating from backend...</p>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Sarthak', 'Alice', 'Bob'].map((name, i) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <span style={{ fontWeight: '500' }}>{name}</span>
                <div style={{ width: '60%', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${80 - (i * 20)}%`, height: '100%', background: '#6366f1' }}></div>
                </div>
                <span>{80 - (i * 20)}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsPage;

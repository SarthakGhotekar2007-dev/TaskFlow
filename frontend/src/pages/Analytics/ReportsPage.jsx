import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import { FiDownload, FiFileText } from 'react-icons/fi';

const ReportsPage = () => {
  const reports = [
    { title: 'Weekly Productivity Report', date: 'Jul 24, 2026', type: 'PDF' },
    { title: 'Monthly Team Overview', date: 'Jul 01, 2026', type: 'CSV' },
    { title: 'Q2 Performance Analytics', date: 'Jun 30, 2026', type: 'Excel' },
  ];

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <header className="page-header">
          <h1>Export & Reports</h1>
        </header>
        
        <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Generated Reports</h3>
            <button className="btn" style={{ background: '#6366f1', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}>
              + Generate New
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reports.map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.6)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <FiFileText size={24} color="#8b5cf6" />
                  <div>
                    <h4 style={{ margin: 0 }}>{r.title}</h4>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Generated on {r.date}</span>
                  </div>
                </div>
                <button style={{ background: 'transparent', border: '1px solid #d1d5db', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <FiDownload /> {r.type}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

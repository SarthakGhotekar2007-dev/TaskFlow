import React from 'react';

const HeatMap = ({ data = [] }) => {
  // A simple representation of a contribution heatmap
  // In a real app, this would use a library like react-calendar-heatmap
  return (
    <div className="glass" style={{ padding: '20px', borderRadius: '16px', marginTop: '20px' }}>
      <h3 style={{ marginBottom: '16px' }}>Activity Heatmap</h3>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <div 
            key={i} 
            style={{ 
              width: '14px', 
              height: '14px', 
              backgroundColor: i % 5 === 0 ? '#10b981' : i % 3 === 0 ? '#a7f3d0' : '#f1f5f9',
              borderRadius: '2px'
            }} 
            title={`Day ${i+1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeatMap;

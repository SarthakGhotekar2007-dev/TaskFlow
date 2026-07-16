import React from 'react';

const AchievementCard = () => {
  const achievements = [
    { title: 'First Task', icon: '🏆', date: 'Jul 1, 2026' },
    { title: '10 Tasks Done', icon: '🚀', date: 'Jul 15, 2026' },
  ];

  return (
    <div className="glass" style={{ padding: '20px', borderRadius: '16px' }}>
      <h3 style={{ marginBottom: '16px' }}>Recent Achievements</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {achievements.map((ach, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.5)', borderRadius: '12px' }}>
            <div style={{ fontSize: '24px', background: 'white', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              {ach.icon}
            </div>
            <div>
              <h4 style={{ margin: 0 }}>{ach.title}</h4>
              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Earned on {ach.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementCard;

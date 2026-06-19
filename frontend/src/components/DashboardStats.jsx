import React from 'react';

const DashboardStats = ({ stats }) => {
  const { total = 0, pending = 0, inProgress = 0, completed = 0 } = stats || {};

  return (
    <div className="stats-grid">
      <div className="stat-card stat-total">
        <div className="stat-info">
          <h3>Total Tasks</h3>
          <div className="stat-value">{total}</div>
        </div>
        <div className="stat-icon">📋</div>
      </div>

      <div className="stat-card stat-pending">
        <div className="stat-info">
          <h3>Pending</h3>
          <div className="stat-value">{pending}</div>
        </div>
        <div className="stat-icon">⏳</div>
      </div>

      <div className="stat-card stat-progress">
        <div className="stat-info">
          <h3>In Progress</h3>
          <div className="stat-value">{inProgress}</div>
        </div>
        <div className="stat-icon">⚙️</div>
      </div>

      <div className="stat-card stat-completed">
        <div className="stat-info">
          <h3>Completed</h3>
          <div className="stat-value">{completed}</div>
        </div>
        <div className="stat-icon">✅</div>
      </div>
    </div>
  );
};

export default DashboardStats;

import { useState, useEffect } from 'react';
import { getItemStats } from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getItemStats();
        setStats(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load dashboard statistics');
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  if (isLoading) {
    return (
      <div className="dashboard mb-5">
        <h3 className="mb-4">Dashboard</h3>
        <div className="row g-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="col-md-6 col-lg-3">
              <div className="stats-card p-3">
                <div className="placeholder-glow">
                  <span className="placeholder col-6"></span>
                  <div className="placeholder col-4 mt-2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!stats) return null;
  
  const counters = {
    lost: 0,
    found: 0,
    resolved: 0,
    claimed: 0
  };
  
  stats.statusCounts.forEach(item => {
    counters[item.status] = Number(item.count);
  });
  
  const totalCount = stats.totalCount ?? Object.values(counters).reduce((sum, value) => sum + value, 0);
  const activeCount = stats.activeCount ?? (counters.lost + counters.found);
  const recentCount = stats.recentCount ?? 0;
  
  return (
    <div className="dashboard mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">Dashboard</h3>
          <p className="text-muted mb-0">Live snapshot of campus activity</p>
        </div>
        <span className="badge bg-success fw-semibold px-3 py-2 rounded-pill">
          Updated now
        </span>
      </div>
      
      <div className="row g-3">
        <div className="col-md-6 col-lg-3">
          <div className="stats-card p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted mb-1 small">Total Items</p>
                <h4 className="mb-0">{totalCount}</h4>
              </div>
              <span className="stats-icon"><i className="bi bi-collection"></i></span>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 col-lg-3">
          <div className="stats-card p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted mb-1 small">Active Now</p>
                <h4 className="mb-0">{activeCount}</h4>
              </div>
              <span className="stats-icon"><i className="bi bi-lightning-charge"></i></span>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 col-lg-3">
          <div className="stats-card p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted mb-1 small">Resolved</p>
                <h4 className="mb-0">{counters.resolved}</h4>
              </div>
              <span className="stats-icon"><i className="bi bi-check2-circle"></i></span>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 col-lg-3">
          <div className="stats-card p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted mb-1 small">Added This Week</p>
                <h4 className="mb-0">{recentCount}</h4>
              </div>
              <span className="stats-icon"><i className="bi bi-calendar-week"></i></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

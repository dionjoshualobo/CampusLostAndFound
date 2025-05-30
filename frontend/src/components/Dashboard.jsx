import { useState, useEffect } from 'react';
import { getItemStats } from '../api';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/dateUtils';

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
  
  if (isLoading) return <div>Loading statistics...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!stats) return null;
  
  // Create counters object - remove claimed, keep only resolved
  const counters = {
    lost: 0,
    found: 0,
    resolved: 0
  };
  
  // Update counters from stats
  stats.statusCounts.forEach(item => {
    counters[item.status] = item.count;
  });
  
  return (
    <div className="dashboard mb-5">
      <h3 className="mb-4">Dashboard</h3>
      
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-danger text-white">
            <div className="card-body text-center">
              <h5 className="card-title">Lost Items</h5>
              <h2>{counters.lost}</h2>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h5 className="card-title">Found Items</h5>
              <h2>{counters.found}</h2>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h5 className="card-title">Resolved</h5>
              <h2>{counters.resolved}</h2>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              Categories
            </div>
            <div className="card-body">
              <ul className="list-group">
                {stats.categoryCounts.slice(0, 5).map((category, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    {category.name}
                    <span className="badge bg-primary rounded-pill">{category.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              Recent Activity
            </div>
            <div className="card-body">
              <ul className="list-group">
                {stats.recentActivity.map(item => (
                  <li key={item.id} className="list-group-item">
                    <div className="d-flex w-100 justify-content-between">
                      <Link to={`/items/${item.id}`}>{item.title}</Link>
                      <small className="text-muted">
                        {formatDate(item.createdAt)}
                      </small>
                    </div>
                    <small>
                      Reported as <span className="badge bg-secondary">{item.status}</span> by {item.userName}
                    </small>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

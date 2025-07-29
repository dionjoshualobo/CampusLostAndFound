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
    <div className="mb-8">
      <h3 className="text-2xl font-bold mb-6 text-red-500">Dashboard (Test: This should be red)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stats shadow bg-blue-100">
          <div className="stat">
            <div className="stat-figure text-error">
              {/* SVG removed for testing */}
            </div>
            <div className="stat-title">Lost Items</div>
            <div className="stat-value text-error">{counters.lost}</div>
            <div className="stat-desc">Items reported as lost</div>
          </div>
        </div>
        
        <div className="stats shadow bg-green-100">
          <div className="stat">
            <div className="stat-figure text-primary">
              {/* SVG removed for testing */}
            </div>
            <div className="stat-title">Found Items</div>
            <div className="stat-value text-primary">{counters.found}</div>
            <div className="stat-desc">Items reported as found</div>
          </div>
        </div>
        
        <div className="stats shadow bg-yellow-100">
          <div className="stat">
            <div className="stat-figure text-success">
              {/* SVG removed for testing */}
            </div>
            <div className="stat-title">Resolved</div>
            <div className="stat-value text-success">{counters.resolved}</div>
            <div className="stat-desc">Successfully returned</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

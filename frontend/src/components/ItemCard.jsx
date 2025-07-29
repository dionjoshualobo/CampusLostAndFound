import { Link } from 'react-router-dom';

const ItemCard = ({ item }) => {
  // Update to use different classes for each status
  const getStatusClass = (status) => {
    switch(status) {
      case 'lost': return 'item-status-lost';
      case 'found': return 'item-status-found';
      case 'claimed': return 'item-status-claimed';
      case 'resolved': return 'item-status-resolved';
      default: return '';
    }
  };
  
  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
      <div className="card-body">
        <h2 className="card-title">
          {item.title}
          <div className={`badge ${
            item.status === 'lost' ? 'badge-error' :
            item.status === 'found' ? 'badge-primary' :
            item.status === 'claimed' ? 'badge-warning' : 'badge-success'
          }`}>
            {item.status.toUpperCase()}
          </div>
        </h2>
        
        <p className="text-base-content/70">
          {item.description?.length > 100 
            ? `${item.description.substring(0, 100)}...` 
            : item.description}
        </p>
        
        <div className="flex justify-between text-sm text-base-content/60 mb-4">
          <span>📍 {item.location || 'Not specified'}</span>
          <span>👤 {item.userName || 'Anonymous'}</span>
        </div>
        
        <div className="card-actions justify-end">
          <Link to={`/items/${item.id}`} className="btn btn-primary btn-sm">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;

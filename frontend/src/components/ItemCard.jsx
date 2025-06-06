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
    <div className={`card mb-3 ${getStatusClass(item.status)}`}>
      <div className="card-body">
        <h5 className="card-title">{item.title}</h5>
        <h6 className="card-subtitle mb-2 text-muted">
          Status: <span className={`fw-bold badge ${
            item.status === 'lost' ? 'bg-danger' :
            item.status === 'found' ? 'bg-primary' :
            item.status === 'claimed' ? 'bg-warning' : 'bg-success'
          }`}>
            {item.status.toUpperCase()}
          </span>
        </h6>
        <p className="card-text">
          {item.description?.length > 100 
            ? `${item.description.substring(0, 100)}...` 
            : item.description}
        </p>
        <div className="d-flex justify-content-between">
          <small className="text-muted">
            Location: {item.location || 'Not specified'}
          </small>
          <small className="text-muted">
            Reported by: {item.userName || 'Anonymous'}
          </small>
        </div>
        <div className="mt-3">
          <Link to={`/items/${item.id}`} className="btn btn-primary btn-sm">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;

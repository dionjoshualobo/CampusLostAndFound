import { Link } from 'react-router-dom';
import { formatDate } from '../utils/dateUtils';

const ItemCard = ({ item }) => {
  const statusLabel = item.status?.toLowerCase() || 'lost';
  const primaryImage = item.images?.[0]?.url;
  
  return (
    <div className="item-card">
      <div className="item-card__image">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={`${item.status || 'Item'}: ${item.title}`}
            loading="lazy"
          />
        ) : (
          <div className="item-card__placeholder">
            <i className="bi bi-image"></i>
          </div>
        )}
      </div>
      <div className="item-card__body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h5 className="mb-1">{item.title}</h5>
            <p className="text-muted small mb-0">
              {item.categoryName || 'Uncategorized'} • {formatDate(item.dateLost)}
            </p>
          </div>
          <span className={`badge-soft ${statusLabel}`}>
            {item.status?.toUpperCase() || 'LOST'}
          </span>
        </div>
        <p className="card-text mb-0">
          {item.description?.length > 120 
            ? `${item.description.substring(0, 120)}...` 
            : item.description}
        </p>
        <div className="item-card__meta">
          <span><i className="bi bi-geo-alt me-1"></i>{item.location || 'Not specified'}</span>
          <span><i className="bi bi-person me-1"></i>{item.userName || 'Anonymous'}</span>
        </div>
        <div className="item-card__footer">
          <Link to={`/items/${item.id}`} className="btn btn-outline-primary btn-sm">
            View Details
          </Link>
          <small className="text-muted">
            Reported {formatDate(item.createdAt)}
          </small>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getItem, deleteItem, claimItem } from '../api';
import CommentSection from '../components/CommentSection';
import ContactInfoModal from '../components/ContactInfoModal';
import { formatDate } from '../utils/dateUtils';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  
  const isAuthenticated = !!localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await getItem(id);
        setItem(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching item details:', err);
        setError('Failed to load item details. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchItem();
  }, [id]);
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteItem(id);
      navigate('/');
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(err.response?.data?.message || 'Failed to delete item. Please try again.');
      setIsDeleting(false);
    }
  };
  
  const handleClaimOrResolve = async (action) => {
    console.log(`Action triggered: ${action}`);
    
    const confirmMessage = action === 'resolve' 
      ? 'Are you sure you want to mark this item as resolved?' 
      : 'Notify the original poster that you have information about this item?';
      
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsClaiming(true);
    setError(null);
    
    try {
      console.log(`Sending action "${action}" to API for item ${id}`);
      const response = await claimItem(id, action);
      console.log('Response received:', response.data);
      
      if (response.data.notificationSent) {
        setSuccess('Notification sent to the item owner. They will contact you if they want to proceed.');
      }
      
      setItem(response.data);
      setIsClaiming(false);
    } catch (err) {
      console.error('Error updating item status:', err);
      setError(err.response?.data?.message || 'Failed to update item status. Please try again.');
      setIsClaiming(false);
    }
  };
  
  if (isLoading) return <div>Loading item details...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!item) return <div className="alert alert-warning">Item not found</div>;
  
  const statusClass = 
    item.status === 'lost' ? 'item-status-lost' : 
    item.status === 'found' ? 'item-status-found' : 
    item.status === 'claimed' ? 'item-status-claimed' : 'item-status-resolved';
  
  const statusBadgeClass = 
    item.status === 'lost' ? 'bg-danger' :
    item.status === 'found' ? 'bg-primary' :
    item.status === 'claimed' ? 'bg-warning' : 'bg-success';
  
  const isOwner = user && user.id === item.userId;
  const canClaimOrResolve = isAuthenticated && !isOwner && (item.status === 'lost' || item.status === 'found');
  const isActiveItem = item.status === 'lost' || item.status === 'found';
  const showClaimerContact = isOwner && item.claimedBy && item.status !== 'resolved';
  
  return (
    <div className="row justify-content-center">
      <div className="col-md-10">
        <div className={`card ${statusClass}`}>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="card-title">{item.title}</h2>
              <span className={`badge ${statusBadgeClass}`}>
                {item.status.toUpperCase()}
              </span>
            </div>
            
            <div className="row mb-4">
              <div className="col-md-4">
                <p><strong>Location:</strong> {item.location || 'Not specified'}</p>
              </div>
              <div className="col-md-4">
                <p>
                  <strong>Date {item.status === 'lost' ? 'Lost' : 'Found'}:</strong> {formatDate(item.dateLost)}
                </p>
              </div>
              <div className="col-md-4">
                <p><strong>Category:</strong> {item.categoryName || 'Not specified'}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <h5>Description</h5>
              <p>{item.description || 'No description provided.'}</p>
            </div>
            
            <div className="mb-3">
              <p className="text-muted">
                Reported by: {item.userName || 'Anonymous'}
              </p>
              
              {item.claimedByName && (
                <div className="d-flex align-items-center">
                  <p className="text-muted mb-0 me-3">
                    {item.status === 'claimed' ? 'Claimed by' : 'Resolved by'}: {item.claimedByName}
                    {item.claimedAt && ` on ${formatDate(item.claimedAt)}`}
                  </p>
                  
                  {showClaimerContact && (
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setShowContactModal(true)}
                    >
                      View Contact Info
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            
            <div className="d-flex justify-content-between">
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/')}
              >
                Back to List
              </button>
              
              <div>
                {canClaimOrResolve && (
                  <button
                    className={`btn ${item.status === 'lost' ? 'btn-success' : 'btn-primary'} me-2`}
                    onClick={() => handleClaimOrResolve('notify')}
                    disabled={isClaiming}
                  >
                    {isClaiming ? 'Processing...' : item.status === 'lost' ? 'I Found This' : 'I Lost This'}
                  </button>
                )}
                
                {isOwner && isActiveItem && (
                  <button
                    className="btn btn-info me-2"
                    onClick={() => handleClaimOrResolve('resolve')}
                    disabled={isClaiming}
                  >
                    {isClaiming ? 'Processing...' : 'Mark as Resolved'}
                  </button>
                )}
                
                {isOwner && (
                  <button
                    className="btn btn-danger"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Item'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <CommentSection itemId={id} isAuthenticated={isAuthenticated} />
      </div>
      
      <ContactInfoModal 
        userId={item?.claimedBy} 
        isOpen={showContactModal} 
        onClose={() => setShowContactModal(false)} 
      />
    </div>
  );
};

export default ItemDetails;

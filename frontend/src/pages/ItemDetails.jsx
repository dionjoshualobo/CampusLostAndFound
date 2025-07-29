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
  
  if (isLoading) return (
    <div className="flex items-center justify-center p-8">
      <span className="loading loading-spinner loading-lg"></span>
      <span className="ml-4">Loading item details...</span>
    </div>
  );
  
  if (error) return (
    <div className="alert alert-error">
      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{error}</span>
    </div>
  );
  
  if (!item) return (
    <div className="alert alert-warning">
      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <span>Item not found</span>
    </div>
  );
  
  const statusClass = 
    item.status === 'lost' ? 'item-status-lost' : 
    item.status === 'found' ? 'item-status-found' : 
    item.status === 'claimed' ? 'item-status-claimed' : 'item-status-resolved';
  
  const statusBadgeClass = 
    item.status === 'lost' ? 'badge-error' :
    item.status === 'found' ? 'badge-primary' :
    item.status === 'claimed' ? 'badge-warning' : 'badge-success';
  
  const isOwner = user && user.id === item.userId;
  const canClaimOrResolve = isAuthenticated && !isOwner && (item.status === 'lost' || item.status === 'found');
  const isActiveItem = item.status === 'lost' || item.status === 'found';
  const showClaimerContact = isOwner && item.claimedBy && item.status !== 'resolved';
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-start mb-6">
            <h1 className="card-title text-3xl">{item.title}</h1>
            <div className={`badge ${statusBadgeClass} badge-lg`}>
              {item.status.toUpperCase()}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-figure text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="stat-title">Location</div>
              <div className="stat-value text-lg">{item.location || 'Not specified'}</div>
            </div>
            
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-figure text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a4 4 0 118 0v4m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="stat-title">Date {item.status === 'lost' ? 'Lost' : 'Found'}</div>
              <div className="stat-value text-lg">{formatDate(item.dateLost)}</div>
            </div>
            
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-figure text-accent">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div className="stat-title">Category</div>
              <div className="stat-value text-lg">{item.categoryName || 'Not specified'}</div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Description</h3>
            <div className="bg-base-200 p-4 rounded-lg">
              <p className="text-base-content">{item.description || 'No description provided.'}</p>
            </div>
          </div>
          
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-base-content/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-base-content/70">
                Reported by: <span className="font-medium">{item.userName || 'Anonymous'}</span>
              </span>
            </div>
            
            {item.claimedByName && (
              <div className="flex items-center justify-between bg-base-200 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-base-content">
                    {item.status === 'claimed' ? 'Claimed by' : 'Resolved by'}: <span className="font-medium">{item.claimedByName}</span>
                    {item.claimedAt && ` on ${formatDate(item.claimedAt)}`}
                  </span>
                </div>
                
                {showClaimerContact && (
                  <button 
                    className="btn btn-sm btn-outline btn-primary"
                    onClick={() => setShowContactModal(true)}
                  >
                    View Contact Info
                  </button>
                )}
              </div>
            )}
          </div>
          
          {error && (
            <div className="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="alert alert-success mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{success}</span>
            </div>
          )}
          
          <div className="flex flex-wrap justify-between gap-4">
            <button
              className="btn btn-outline"
              onClick={() => navigate('/')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to List
            </button>
            
            <div className="flex flex-wrap gap-2">
              {canClaimOrResolve && (
                <button
                  className={`btn ${item.status === 'lost' ? 'btn-success' : 'btn-primary'} ${isClaiming ? 'loading' : ''}`}
                  onClick={() => handleClaimOrResolve('notify')}
                  disabled={isClaiming}
                >
                  {isClaiming ? 'Processing...' : item.status === 'lost' ? 'I Found This' : 'I Lost This'}
                </button>
              )}
              
              {isOwner && isActiveItem && (
                <button
                  className={`btn btn-info ${isClaiming ? 'loading' : ''}`}
                  onClick={() => handleClaimOrResolve('resolve')}
                  disabled={isClaiming}
                >
                  {isClaiming ? 'Processing...' : 'Mark as Resolved'}
                </button>
              )}
              
              {isOwner && (
                <button
                  className={`btn btn-error ${isDeleting ? 'loading' : ''}`}
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
      
      <div className="mt-8">
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

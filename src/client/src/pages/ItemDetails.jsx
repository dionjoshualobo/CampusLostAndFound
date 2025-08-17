import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getItem, deleteItem, claimItem, deleteItemImage } from '../api';
import CommentSection from '../components/CommentSection';
import ContactInfoModal from '../components/ContactInfoModal';
import ProfileCompletionModal from '../components/ProfileCompletionModal';
import { formatDate } from '../utils/dateUtils';
import { isProfileComplete } from '../utils/profileUtils';

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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
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
    // Check profile completion before allowing action
    if (!isProfileComplete(user)) {
      setShowProfileModal(true);
      return;
    }
    
    const confirmMessage = action === 'resolve' 
      ? 'Are you sure you want to mark this item as resolved?' 
      : 'Notify the original poster that you have information about this item?';
      
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsClaiming(true);
    setError(null);
    
    try {
      const response = await claimItem(id, action);
      
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

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      await deleteItemImage(id, imageId);
      // Refresh item data to update images
      const response = await getItem(id);
      setItem(response.data);
      setSuccess('Image deleted successfully');
    } catch (err) {
      console.error('Error deleting image:', err);
      setError(err.response?.data?.message || 'Failed to delete image. Please try again.');
    }
  };

  const openImageModal = (index) => {
    setSelectedImageIndex(index);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
  };

  const nextImage = () => {
    if (item.images && item.images.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % item.images.length);
    }
  };

  const prevImage = () => {
    if (item.images && item.images.length > 0) {
      setSelectedImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
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
    <>
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

              {/* Image Gallery */}
              {item.images && item.images.length > 0 && (
                <div className="mb-4">
                  <h5>Images</h5>
                  <div className="row">
                    {item.images.map((image, index) => (
                      <div key={image.id} className="col-md-3 mb-3">
                        <div className="position-relative">
                          <img
                            src={image.url}
                            alt={`${item.title} - Image ${index + 1}`}
                            className="img-thumbnail cursor-pointer"
                            style={{ width: '100%', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => openImageModal(index)}
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
                            }}
                          />
                          {isOwner && (
                            <button
                              className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteImage(image.id);
                              }}
                              title="Delete image"
                              style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
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

      {/* Image Modal */}
      {isImageModalOpen && item.images && item.images.length > 0 && (
        <div 
          className="modal d-block" 
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.8)', 
            zIndex: 1050 
          }}
          onClick={closeImageModal}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content bg-transparent border-0">
              <div className="modal-body p-0 position-relative">
                <button
                  type="button"
                  className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
                  style={{ zIndex: 1051 }}
                  onClick={closeImageModal}
                ></button>
                
                <img
                  src={item.images[selectedImageIndex]?.url}
                  alt={`${item.title} - Image ${selectedImageIndex + 1}`}
                  className="img-fluid w-100"
                  style={{ maxHeight: '80vh', objectFit: 'contain' }}
                  onClick={(e) => e.stopPropagation()}
                />
                
                {item.images.length > 1 && (
                  <>
                    <button
                      className="btn btn-light position-absolute top-50 start-0 translate-middle-y ms-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      style={{ zIndex: 1051 }}
                    >
                      ‹
                    </button>
                    
                    <button
                      className="btn btn-light position-absolute top-50 end-0 translate-middle-y me-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      style={{ zIndex: 1051 }}
                    >
                      ›
                    </button>
                    
                    <div 
                      className="position-absolute bottom-0 start-50 translate-middle-x mb-3 text-white bg-dark bg-opacity-75 px-2 py-1 rounded"
                      style={{ zIndex: 1051 }}
                    >
                      {selectedImageIndex + 1} / {item.images.length}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ProfileCompletionModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        actionDescription={
          item?.status === 'lost' ? 'claim you found this item' : 'claim you lost this item'
        }
      />
    </>
  );
};

export default ItemDetails;

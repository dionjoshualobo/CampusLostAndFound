import { useState, useEffect } from 'react';
import { getUserContact } from '../api';

const ContactInfoModal = ({ userId, isOpen, onClose }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchUserContact = async () => {
      if (!userId || !isOpen) {
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await getUserContact(userId);
        setUserInfo(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching user contact:', err);
        setError('Failed to load user contact information. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchUserContact();
  }, [userId, isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="position-fixed"
      style={{ 
        top: '80px', // Position it below the navbar
        right: '20px', // Position it from the right side
        zIndex: 1055,
        maxWidth: '400px',
        width: '90vw'
      }}
      onClick={(e) => {
        // Close modal when clicking backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded shadow-lg border"
        style={{
          maxHeight: '80vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-0">
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
            <h5 className="modal-title mb-0">User Contact Information</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          
          <div className="p-3">
            {isLoading ? (
              <div className="d-flex justify-content-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : userInfo ? (
              <div className="container-fluid">
                <div className="row mb-2">
                  <div className="col-4"><strong>Name:</strong></div>
                  <div className="col-8">{userInfo.name || 'Not provided'}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-4"><strong>Email:</strong></div>
                  <div className="col-8">{userInfo.email || 'Not provided'}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-4"><strong>User Type:</strong></div>
                  <div className="col-8">
                    <span className="badge bg-secondary">
                      {userInfo.userType || 'Not specified'}
                    </span>
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-4"><strong>Department:</strong></div>
                  <div className="col-8">{userInfo.department || 'Not specified'}</div>
                </div>
                {userInfo.userType === 'student' && userInfo.semester && (
                  <div className="row mb-2">
                    <div className="col-4"><strong>Semester:</strong></div>
                    <div className="col-8">
                      <span className="badge bg-info">
                        {userInfo.semester}
                      </span>
                    </div>
                  </div>
                )}
                <div className="row mb-2">
                  <div className="col-4"><strong>Contact Info:</strong></div>
                  <div className="col-8">
                    <span className="fw-bold text-primary">
                      {userInfo.contactInfo || 'Not provided'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="alert alert-warning">No information available</div>
            )}
          </div>
          
          <div className="d-flex justify-content-end p-3 border-top">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoModal;

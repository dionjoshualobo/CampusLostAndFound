import { useState, useEffect } from 'react';
import { getUserContact } from '../api';

const ContactInfoModal = ({ userId, isOpen, onClose }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchUserContact = async () => {
      if (!userId || !isOpen) return;
      
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
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">User Contact Information</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {isLoading ? (
              <p>Loading user information...</p>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : userInfo ? (
              <div>
                <p><strong>Name:</strong> {userInfo.name}</p>
                <p><strong>Email:</strong> {userInfo.email}</p>
                <p><strong>User Type:</strong> {userInfo.userType || 'Not specified'}</p>
                <p><strong>Department:</strong> {userInfo.department || 'Not specified'}</p>
                {userInfo.userType === 'student' && userInfo.semester && (
                  <p><strong>Semester:</strong> {userInfo.semester}</p>
                )}
                <p><strong>Contact Info:</strong> {userInfo.contactInfo || 'Not provided'}</p>
              </div>
            ) : (
              <p>No information available</p>
            )}
          </div>
          
          <div className="modal-footer">
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

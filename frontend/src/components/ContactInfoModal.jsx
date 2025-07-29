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
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">User Contact Information</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>✕</button>
        </div>
        
        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <span className="loading loading-spinner loading-lg"></span>
              <span className="ml-4">Loading user information...</span>
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          ) : userInfo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <span className="font-semibold">Name:</span>
                  <span className="ml-2">{userInfo.name}</span>
                </div>
                <div>
                  <span className="font-semibold">Email:</span>
                  <span className="ml-2">{userInfo.email}</span>
                </div>
                <div>
                  <span className="font-semibold">User Type:</span>
                  <span className="ml-2">{userInfo.userType || 'Not specified'}</span>
                </div>
                <div>
                  <span className="font-semibold">Department:</span>
                  <span className="ml-2">{userInfo.department || 'Not specified'}</span>
                </div>
                {userInfo.userType === 'student' && userInfo.semester && (
                  <div>
                    <span className="font-semibold">Semester:</span>
                    <span className="ml-2">{userInfo.semester}</span>
                  </div>
                )}
                <div>
                  <span className="font-semibold">Contact Info:</span>
                  <span className="ml-2">{userInfo.contactInfo || 'Not provided'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>No information available</span>
            </div>
          )}
        </div>
        
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoModal;

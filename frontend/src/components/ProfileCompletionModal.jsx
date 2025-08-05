import { useNavigate } from 'react-router-dom';
import { getMissingFields } from '../utils/profileUtils';

const ProfileCompletionModal = ({ isOpen, onClose, user, actionDescription }) => {
  const navigate = useNavigate();
  
  if (!isOpen) return null;
  
  const missingFields = getMissingFields(user);
  
  const handleContinueToProfile = () => {
    onClose();
    navigate('/profile?redirect=true');
  };
  
  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Complete Your Profile</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            <div className="alert alert-info">
              <strong>Profile completion is mandatory</strong> to {actionDescription}.
            </div>
            
            <p>To continue, please complete the following required fields in your profile:</p>
            
            <ul className="list-group list-group-flush mb-3">
              {missingFields.map((field, index) => (
                <li key={index} className="list-group-item d-flex align-items-center">
                  <i className="bi bi-exclamation-circle text-warning me-2"></i>
                  {field}
                </li>
              ))}
            </ul>
            
            <p className="mb-0">
              Would you like to go to your profile page to complete these details?
            </p>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              No, I'll do it later
            </button>
            <button type="button" className="btn btn-primary" onClick={handleContinueToProfile}>
              Yes, complete my profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionModal;

import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../api';
import { formatDate } from '../utils/dateUtils';
import { getMissingFields, isProfileComplete, validateContactInfo } from '../utils/profileUtils';

// List of department options
const departments = [
  'CSE',
  'ICBS',
  'Civil',
  'Mechanical',
  'EEE',
  'ECE'
];

const Profile = ({ refreshUserProfile }) => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    userType: 'student', // Default to student
    department: '',
    semester: '',
    contactInfo: ''
  });
  
  const [userItems, setUserItems] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showCompletionAlert, setShowCompletionAlert] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const requiredFieldCount = useMemo(
    () => (profileData.userType === 'student' ? 5 : 4),
    [profileData.userType]
  );
  const missingFields = useMemo(() => {
    return getMissingFields({
      ...profileData,
      userType: profileData.userType
    });
  }, [profileData]);
  const completionPercent = useMemo(() => {
    return Math.max(
      0,
      Math.round(((requiredFieldCount - missingFields.length) / requiredFieldCount) * 100)
    );
  }, [missingFields, requiredFieldCount]);
  
  // Check if user was redirected here for profile completion
  useEffect(() => {
    const reason = searchParams.get('reason');
    if (searchParams.get('redirect') === 'true') {
      setShowCompletionAlert(true);
      if (reason === 'mandatory') {
        setError('Profile completion is mandatory. Please fill in all required fields to continue using the platform.');
      }
    }
  }, [searchParams]);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile();
        
        setProfileData({
          name: response.data.user.name,
          email: response.data.user.email || '',
          userType: response.data.user.userType || 'student',
          department: response.data.user.department || '',
          semester: response.data.user.semester || '',
          contactInfo: response.data.user.contactInfo || ''
        });
        setUserItems(response.data.items);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, []);
  
  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };
  
  const validateProfileForm = () => {
    const errors = {};
    
    if (!profileData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!profileData.userType) {
      errors.userType = 'User type is required';
    }
    
    if (!profileData.department) {
      errors.department = 'Department is required';
    }
    
    if (profileData.userType === 'student' && !profileData.semester) {
      errors.semester = 'Semester is required for students';
    }
    
    if (!profileData.contactInfo.trim()) {
      errors.contactInfo = 'Contact information is required';
    } else {
      const contactValidation = validateContactInfo(profileData.contactInfo);
      if (!contactValidation.isValid) {
        errors.contactInfo = contactValidation.message;
      }
    }
    
    return errors;
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setValidationErrors({});
    
    // Validate form
    const errors = validateProfileForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError('Please fix the validation errors below.');
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const response = await updateUserProfile({
        name: profileData.name,
        userType: profileData.userType,
        department: profileData.department,
        semester: profileData.userType === 'student' ? profileData.semester : null,
        contactInfo: profileData.contactInfo
      });
      
      setProfileData({
        ...profileData,
        name: response.data.name,
        userType: response.data.userType || 'student',
        department: response.data.department || '',
        semester: response.data.semester || '',
        contactInfo: response.data.contactInfo || ''
      });
      
      // Update localStorage with new user data
      const updatedUser = {
        ...JSON.parse(localStorage.getItem('user') || '{}'),
        ...response.data
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Refresh user profile in App component to update navbar
      if (refreshUserProfile) {
        await refreshUserProfile();
      }
      
      // Check if profile is now complete
      if (isProfileComplete(updatedUser)) {
        setSuccess('Profile updated successfully! You can now access all features.');
        setShowCompletionAlert(false);
        
        // If this was a redirect for completion, show option to go back
        if (searchParams.get('redirect') === 'true') {
          setTimeout(() => {
            const shouldGoBack = window.confirm('Profile completed! Would you like to go back to what you were doing?');
            if (shouldGoBack) {
              navigate(-1);
            }
          }, 2000);
        }
      } else {
        setSuccess('Profile updated successfully');
      }
      
      setIsUpdating(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
      setIsUpdating(false);
    }
  };
  
  if (isLoading) return <div>Loading profile...</div>;
  
  return (
    <div className="row">
      <div className="col-md-3">
        <div className="list-group mb-4">
          <button
            className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="bi bi-person-lines-fill"></i>
            Profile Information
          </button>
          <button
            className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${activeTab === 'items' ? 'active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            <i className="bi bi-collection"></i>
            My Items
          </button>
        </div>
      </div>
      
      <div className="col-md-9">
        <div className="card profile-summary p-4 mb-4">
          <div className="d-flex align-items-center gap-3">
            <span className="stats-icon"><i className="bi bi-person-circle"></i></span>
            <div>
              <h4 className="mb-1">{profileData.name || 'Your Profile'}</h4>
              <p className="text-muted mb-0">{profileData.email || 'Update your profile details'}</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small className="text-muted">Profile completion</small>
              <small className="fw-semibold">{completionPercent}%</small>
            </div>
            <div className="progress" style={{ height: '8px' }}>
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${completionPercent}%` }}
                aria-valuenow={completionPercent}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
            {missingFields.length > 0 ? (
              <div className="d-flex flex-wrap gap-2 mt-3">
                {missingFields.map((field, index) => (
                  <span key={index} className="badge bg-warning text-dark">
                    {field} required
                  </span>
                ))}
              </div>
            ) : (
              <div className="mt-3 text-success fw-semibold">
                <i className="bi bi-check-circle me-1"></i>
                Profile complete
              </div>
            )}
          </div>
        </div>

        {showCompletionAlert && (
          <div className="alert alert-warning alert-dismissible fade show" role="alert">
            <strong>Profile completion required!</strong> Please fill in all the required fields below to access all features of the platform.
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setShowCompletionAlert(false)}
            ></button>
          </div>
        )}
        
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        {activeTab === 'profile' && (
          <div className="card">
            <div className="card-header">Profile Information</div>
            <div className="card-body">
              <div className="alert alert-info mb-4">
                <strong>All fields are mandatory.</strong> Complete your profile to access all platform features.
              </div>
              
              <form onSubmit={handleProfileSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    required
                  />
                  {validationErrors.name && (
                    <div className="invalid-feedback">{validationErrors.name}</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={profileData.email || ''}
                    disabled
                  />
                  <div className="form-text">Email cannot be changed</div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="userType" className="form-label">
                    User Type <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${validationErrors.userType ? 'is-invalid' : ''}`}
                    id="userType"
                    name="userType"
                    value={profileData.userType}
                    onChange={handleProfileChange}
                    required
                  >
                    <option value="">Select User Type</option>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                  </select>
                  {validationErrors.userType && (
                    <div className="invalid-feedback">{validationErrors.userType}</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="department" className="form-label">
                    Department <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${validationErrors.department ? 'is-invalid' : ''}`}
                    id="department"
                    name="department"
                    value={profileData.department}
                    onChange={handleProfileChange}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept, index) => (
                      <option key={index} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {validationErrors.department && (
                    <div className="invalid-feedback">{validationErrors.department}</div>
                  )}
                </div>
                
                {profileData.userType === 'student' && (
                  <div className="mb-3">
                    <label htmlFor="semester" className="form-label">
                      Semester <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${validationErrors.semester ? 'is-invalid' : ''}`}
                      id="semester"
                      name="semester"
                      value={profileData.semester}
                      onChange={handleProfileChange}
                      required={profileData.userType === 'student'}
                    >
                      <option value="">Select Semester</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                    {validationErrors.semester && (
                      <div className="invalid-feedback">{validationErrors.semester}</div>
                    )}
                  </div>
                )}
                
                <div className="mb-3">
                  <label htmlFor="contactInfo" className="form-label">
                    Contact Information <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${validationErrors.contactInfo ? 'is-invalid' : ''}`}
                    id="contactInfo"
                    name="contactInfo"
                    value={profileData.contactInfo}
                    onChange={handleProfileChange}
                    placeholder="Phone number (10 digits) or alternative email"
                    required
                  />
                  {validationErrors.contactInfo && (
                    <div className="invalid-feedback">{validationErrors.contactInfo}</div>
                  )}
                  <div className="form-text">Provide a 10-digit phone number or alternative email address</div>
                </div>
                
                <div className="mb-3">
                  <small className="text-muted">
                    <span className="text-danger">*</span> All fields are mandatory
                  </small>
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
          </div>
        )}
        
        {activeTab === 'items' && (
          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                My Items
                <Link to="/items/new" className="btn btn-sm btn-primary">
                  Report New Item
                </Link>
              </div>
            </div>
            <div className="card-body">
              {userItems.length === 0 ? (
                <div className="alert alert-info">
                  You haven't reported any items yet.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Category</th>
                        <th>Date Reported</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userItems.map(item => (
                        <tr key={item.id}>
                          <td>{item.title}</td>
                          <td>
                            <span className={`badge ${
                              item.status === 'lost' ? 'bg-danger' :
                              item.status === 'found' ? 'bg-primary' :
                              item.status === 'claimed' ? 'bg-warning' : 'bg-success'
                            }`}>
                              {item.status.toUpperCase()}
                            </span>
                          </td>
                          <td>{item.categoryName || 'Not specified'}</td>
                          <td>{formatDate(item.createdAt)}</td>
                          <td>
                            <Link to={`/items/${item.id}`} className="btn btn-sm btn-outline-primary me-2">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

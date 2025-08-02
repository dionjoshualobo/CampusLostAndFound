import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getUserProfile, updateUserProfile, changePassword } from '../api';
import { formatDate } from '../utils/dateUtils';
import { isProfileComplete, validateContactInfo } from '../utils/profileUtils';

// List of department options
const departments = [
  'CSE',
  'ICBS',
  'Civil',
  'Mechanical',
  'EEE',
  'ECE'
];

const Profile = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    userType: 'student', // Default to student
    department: '',
    semester: '',
    contactInfo: '',
    createdAt: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [userItems, setUserItems] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showCompletionAlert, setShowCompletionAlert] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
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
        console.log('Profile API response:', response.data.user); // Debug log
        
        const userData = response.data.user;
        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
          userType: userData.usertype || userData.userType || 'student', // Handle case variation
          department: userData.department || '',
          semester: userData.semester || '',
          contactInfo: userData.contactinfo || userData.contactInfo || '', // Handle case variation
          createdAt: userData.createdat || userData.createdAt || '' // Handle case variation
        });
        setUserItems(response.data.items || []);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };
  
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
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
      
      // Update localStorage with new user data - include all fields
      const updatedUser = {
        ...JSON.parse(localStorage.getItem('user') || '{}'),
        name: response.data.name,
        userType: response.data.userType,
        department: response.data.department,
        semester: response.data.semester,
        contactInfo: response.data.contactInfo
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Check if profile is now complete
      if (isProfileComplete(updatedUser)) {
        setSuccess('✅ Profile updated successfully! You can now access all platform features.');
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
        setSuccess('Profile updated successfully! Please complete all fields to access all features.');
      }
      
      setIsUpdating(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
      setIsUpdating(false);
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    setIsChangingPassword(true);
    setError(null);
    setSuccess(null);
    
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setSuccess('Password changed successfully');
      setIsChangingPassword(false);
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.response?.data?.message || 'Failed to change password');
      setIsChangingPassword(false);
    }
  };
  
  if (isLoading) return <div>Loading profile...</div>;
  
  return (
    <div className="row">
      <div className="col-md-3">
        <div className="list-group mb-4">
          <button
            className={`list-group-item list-group-item-action ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Information
          </button>
          <button
            className={`list-group-item list-group-item-action ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Change Password
          </button>
          <button
            className={`list-group-item list-group-item-action ${activeTab === 'items' ? 'active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            My Items
          </button>
        </div>
      </div>
      
      <div className="col-md-9">
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
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <span>Profile Information</span>
                <span className={`badge ${isProfileComplete(profileData) ? 'bg-success' : 'bg-warning'}`}>
                  {isProfileComplete(profileData) ? '✓ Complete' : '⚠ Incomplete'}
                </span>
              </div>
            </div>
            <div className="card-body">
              {/* User Summary Card */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <div className="mb-2">
                        <i className="bi bi-person-circle" style={{ fontSize: '3rem' }}></i>
                      </div>
                      <h5 className="card-title">{profileData.name || 'Not Set'}</h5>
                      <p className="card-text text-muted">{profileData.email}</p>
                      {profileData.createdAt && (
                        <small className="text-muted">
                          Member since {formatDate(profileData.createdAt)}
                        </small>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="row">
                    <div className="col-sm-6 mb-3">
                      <strong>User Type:</strong><br />
                      <span className={`badge ${profileData.userType === 'student' ? 'bg-primary' : 'bg-info'}`}>
                        {profileData.userType ? profileData.userType.charAt(0).toUpperCase() + profileData.userType.slice(1) : 'Not Set'}
                      </span>
                    </div>
                    <div className="col-sm-6 mb-3">
                      <strong>Department:</strong><br />
                      <span>{profileData.department || 'Not Set'}</span>
                    </div>
                    {profileData.userType === 'student' && (
                      <div className="col-sm-6 mb-3">
                        <strong>Semester:</strong><br />
                        <span>{profileData.semester || 'Not Set'}</span>
                      </div>
                    )}
                    <div className="col-sm-6 mb-3">
                      <strong>Contact Info:</strong><br />
                      <span>{profileData.contactInfo || 'Not Set'}</span>
                    </div>
                    <div className="col-sm-6 mb-3">
                      <strong>Total Items:</strong><br />
                      <span className="badge bg-secondary">{userItems.length}</span>
                    </div>
                    <div className="col-sm-6 mb-3">
                      <strong>Status:</strong><br />
                      {userItems.length > 0 ? (
                        <div>
                          <small>
                            Lost: {userItems.filter(item => item.status === 'lost').length} | 
                            Found: {userItems.filter(item => item.status === 'found').length} | 
                            Resolved: {userItems.filter(item => item.status === 'resolved').length}
                          </small>
                        </div>
                      ) : (
                        <small className="text-muted">No items reported yet</small>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="alert alert-info mb-4">
                <strong>Complete Profile Required:</strong> All fields are mandatory to access all platform features.
                {profileData.createdAt && (
                  <div className="mt-2">
                    <small><strong>Member since:</strong> {formatDate(profileData.createdAt)}</small>
                  </div>
                )}
              </div>
              
              <form onSubmit={handleProfileSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        placeholder="Enter your full name"
                        required
                      />
                      {validationErrors.name && (
                        <div className="invalid-feedback">{validationErrors.name}</div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={profileData.email || ''}
                        disabled
                      />
                      <div className="form-text">
                        <i className="bi bi-info-circle me-1"></i>
                        Email address cannot be changed. Contact support if you need to update this.
                      </div>
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
                  </div>
                  
                  <div className="col-md-6">
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
                            <option key={num} value={num}>Semester {num}</option>
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
                        placeholder="10-digit phone number or alternative email"
                        required
                      />
                      {validationErrors.contactInfo && (
                        <div className="invalid-feedback">{validationErrors.contactInfo}</div>
                      )}
                      <div className="form-text">
                        <i className="bi bi-telephone me-1"></i>
                        Provide a 10-digit phone number or alternative email address for item-related communications.
                      </div>
                    </div>
                  </div>
                </div>
                
                <hr className="my-4" />
                
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-muted">
                      <span className="text-danger">*</span> Required fields - All fields are mandatory for full platform access
                    </small>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Update Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {activeTab === 'password' && (
          <div className="card">
            <div className="card-header">Change Password</div>
            <div className="card-body">
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-3">
                  <label htmlFor="currentPassword" className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
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

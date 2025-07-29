import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserProfile, updateUserProfile, changePassword } from '../api';
import { formatDate } from '../utils/dateUtils';

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
    contactInfo: ''
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
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile();
        console.log('Profile API response:', response.data.user); // Debug log
        
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
  
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setError(null);
    setSuccess(null);
    
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
      
      setSuccess('Profile updated successfully');
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1">
        <div className="menu bg-base-200 rounded-box p-2">
          <li>
            <button
              className={`${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile Information
            </button>
          </li>
          <li>
            <button
              className={`${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Change Password
            </button>
          </li>
          <li>
            <button
              className={`${activeTab === 'items' ? 'active' : ''}`}
              onClick={() => setActiveTab('items')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              My Items
            </button>
          </li>
        </div>
      </div>
      
      <div className="lg:col-span-3">
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
        
        {activeTab === 'profile' && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-6">Profile Information</h2>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label" htmlFor="name">
                    <span className="label-text">Name</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
                
                <div className="form-control">
                  <label className="label" htmlFor="email">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    className="input input-bordered w-full"
                    id="email"
                    name="email"
                    value={profileData.email || ''}
                    disabled
                  />
                  <label className="label">
                    <span className="label-text-alt">Email cannot be changed</span>
                  </label>
                </div>
                
                <div className="form-control">
                  <label className="label" htmlFor="userType">
                    <span className="label-text">User Type</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    id="userType"
                    name="userType"
                    value={profileData.userType}
                    onChange={handleProfileChange}
                    required
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                  </select>
                </div>
                
                <div className="form-control">
                  <label className="label" htmlFor="department">
                    <span className="label-text">Department</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
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
                </div>
                
                {profileData.userType === 'student' && (
                  <div className="form-control">
                    <label className="label" htmlFor="semester">
                      <span className="label-text">Semester</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
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
                  </div>
                )}
                
                <div className="form-control">
                  <label className="label" htmlFor="contactInfo">
                    <span className="label-text">Contact Information</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    id="contactInfo"
                    name="contactInfo"
                    value={profileData.contactInfo}
                    onChange={handleProfileChange}
                    placeholder="Phone number or alternative contact method"
                  />
                </div>
                
                <div className="form-control mt-6">
                  <button
                    type="submit"
                    className={`btn btn-primary ${isUpdating ? 'loading' : ''}`}
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {activeTab === 'password' && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-6">Change Password</h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label" htmlFor="currentPassword">
                    <span className="label-text">Current Password</span>
                  </label>
                  <input
                    type="password"
                    className="input input-bordered w-full"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                
                <div className="form-control">
                  <label className="label" htmlFor="newPassword">
                    <span className="label-text">New Password</span>
                  </label>
                  <input
                    type="password"
                    className="input input-bordered w-full"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                
                <div className="form-control">
                  <label className="label" htmlFor="confirmPassword">
                    <span className="label-text">Confirm New Password</span>
                  </label>
                  <input
                    type="password"
                    className="input input-bordered w-full"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                
                <div className="form-control mt-6">
                  <button
                    type="submit"
                    className={`btn btn-primary ${isChangingPassword ? 'loading' : ''}`}
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {activeTab === 'items' && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center mb-6">
                <h2 className="card-title">My Items</h2>
                <Link to="/items/new" className="btn btn-primary btn-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Report New Item
                </Link>
              </div>
              
              {userItems.length === 0 ? (
                <div className="alert alert-info">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>You haven't reported any items yet.</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
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
                        <tr key={item.id} className="hover">
                          <td className="font-medium">{item.title}</td>
                          <td>
                            <div className={`badge ${
                              item.status === 'lost' ? 'badge-error' :
                              item.status === 'found' ? 'badge-primary' :
                              item.status === 'claimed' ? 'badge-warning' : 'badge-success'
                            }`}>
                              {item.status.toUpperCase()}
                            </div>
                          </td>
                          <td>{item.categoryName || 'Not specified'}</td>
                          <td>{formatDate(item.createdAt)}</td>
                          <td>
                            <Link to={`/items/${item.id}`} className="btn btn-ghost btn-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
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

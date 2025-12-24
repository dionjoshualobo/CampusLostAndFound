export const isProfileComplete = (user) => {
  if (!user) return false;

  if (user.profile_completed === true) return true;
  if (user.profile_completed === false || user.profile_completed == null) return false;
  return false;
};

export const getMissingFields = (user) => {
  if (!user) return ['Name', 'User Type', 'Department', 'Contact Information'];
  
  const missing = [];
  
  if (!user.name || user.name.trim() === '') missing.push('Name');
  if (!user.userType || user.userType.trim() === '') missing.push('User Type');
  if (!user.department || user.department.trim() === '') missing.push('Department');
  if (!user.contactInfo || user.contactInfo.trim() === '') missing.push('Contact Information');
  if (user.userType === 'student' && (!user.semester || user.semester === '')) {
    missing.push('Semester');
  }
  
  return missing;
};

// New function to validate contact info format
export const validateContactInfo = (contactInfo) => {
  if (!contactInfo || contactInfo.trim() === '') {
    return { isValid: false, message: 'Contact information is required' };
  }
  
  // Check if it's a valid phone number (10 digits) or email format
  const phoneRegex = /^\d{10}$/;
  const emailRegex = /\S+@\S+\.\S+/;
  
  if (!phoneRegex.test(contactInfo) && !emailRegex.test(contactInfo)) {
    return { 
      isValid: false, 
      message: 'Please provide a valid 10-digit phone number or email address' 
    };
  }
  
  return { isValid: true };
};

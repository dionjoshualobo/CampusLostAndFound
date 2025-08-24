// Campus-specific email validation configuration
module.exports = {
  // Set to true to enforce academic emails only
  CAMPUS_ONLY_MODE: false,
  
  // Academic email patterns for your campus
  CAMPUS_EMAIL_DOMAINS: [
    // Add your college/university domains here
    // 'youruniversity.edu',
    // 'college.ac.in',
    // 'students.youruniversity.edu'
  ],
  
  // Additional disposable email domains specific to your region
  ADDITIONAL_DISPOSABLE_DOMAINS: [
    // Add any regional disposable email services
  ],
  
  // Email validation settings
  VALIDATION_SETTINGS: {
    // Enable MX record checking (domain existence)
    CHECK_MX_RECORDS: true,
    
    // Enable typo detection
    CHECK_TYPOS: true,
    
    // Enable disposable email detection
    CHECK_DISPOSABLE: true,
    
    // Timeout for email validation (ms)
    VALIDATION_TIMEOUT: 5000
  }
};

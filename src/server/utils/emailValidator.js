const validator = require('validator');
const { validate } = require('deep-email-validator');
const emailConfig = require('../config/emailValidationConfig');

// List of common disposable email domains to block
const disposableEmailDomains = [
  '10minutemail.com',
  'guerrillamail.com',
  'tempmail.org',
  'throwaway.email',
  'temp-mail.org',
  'mailinator.com',
  'yopmail.com',
  'guerrillamailblock.com',
  'sharklasers.com',
  'grr.la',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.biz',
  'spam4.me',
  'mail.ru',
  'hide.biz.st',
  'mytrashmail.com',
  'mailnesia.com',
  'trashmail.net',
  'fakeinbox.com',
  '0-mail.com',
  '027168.com',
  '10mail.org',
  '123-m.com',
  'getnada.com',
  'harakirimail.com',
  'maildrop.cc',
  'mohmal.com',
  'rootfest.net',
  'spamgourmet.com',
  'tempail.com',
  'tempemail.com',
  'dispostable.com',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
  ...emailConfig.ADDITIONAL_DISPOSABLE_DOMAINS
];

// Common academic email patterns
const academicEmailPatterns = [
  /\.edu$/,
  /\.ac\./,
  /\.edu\./,
  /university/i,
  /college/i,
  /\.sch\./
];

/**
 * Validates email format using basic regex
 * @param {string} email 
 * @returns {boolean}
 */
function isValidEmailFormat(email) {
  return validator.isEmail(email);
}

/**
 * Checks if email domain is in disposable email list
 * @param {string} email 
 * @returns {boolean}
 */
function isDisposableEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  return disposableEmailDomains.includes(domain);
}

/**
 * Checks if email appears to be from an academic institution
 * @param {string} email 
 * @returns {boolean}
 */
function isAcademicEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  
  // Check campus-specific domains first
  if (emailConfig.CAMPUS_EMAIL_DOMAINS.length > 0) {
    return emailConfig.CAMPUS_EMAIL_DOMAINS.some(campusDomain => 
      domain === campusDomain.toLowerCase()
    );
  }
  
  // Fallback to general academic patterns
  return academicEmailPatterns.some(pattern => pattern.test(domain));
}

/**
 * Comprehensive email validation
 * @param {string} email 
 * @param {object} options - Validation options
 * @returns {Promise<object>} Validation result
 */
async function validateEmail(email, options = {}) {
  const result = {
    valid: false,
    reason: '',
    suggestions: []
  };

  // Basic format validation
  if (!isValidEmailFormat(email)) {
    result.reason = 'Invalid email format';
    return result;
  }

  // Check for disposable email
  if (isDisposableEmail(email)) {
    result.reason = 'Disposable email addresses are not allowed';
    return result;
  }

  // If campus-only mode is enabled, check for academic email
  if ((options.campusOnly || emailConfig.CAMPUS_ONLY_MODE) && !isAcademicEmail(email)) {
    result.reason = 'Please use your official college/university email address';
    result.suggestions = ['Use an email ending with .edu', 'Use your college email address'];
    return result;
  }

  try {
    // Advanced validation using deep-email-validator
    const deepValidation = await validate({
      email: email,
      sender: email,
      validateRegex: true,
      validateMx: true,
      validateTypo: true,
      validateDisposable: true,
      validateSMTP: false // Disable SMTP check to avoid connection issues
    });

    if (!deepValidation.valid) {
      if (deepValidation.reason === 'regex') {
        result.reason = 'Invalid email format';
      } else if (deepValidation.reason === 'mx') {
        result.reason = 'Email domain does not exist';
      } else if (deepValidation.reason === 'disposable') {
        result.reason = 'Disposable email addresses are not allowed';
      } else if (deepValidation.reason === 'typo') {
        result.reason = 'Possible typo in email address';
        if (deepValidation.validators?.typo?.suggestion) {
          result.suggestions = [`Did you mean: ${deepValidation.validators.typo.suggestion}?`];
        }
      } else {
        result.reason = 'Invalid email address';
      }
      return result;
    }

    // If we reach here, email passed all validations
    result.valid = true;
    result.reason = 'Valid email address';
    
    // Add helpful info
    if (isAcademicEmail(email)) {
      result.isAcademic = true;
    }

    return result;

  } catch (error) {
    console.error('Email validation error:', error);
    // Fallback to basic validation if deep validation fails
    result.valid = true;
    result.reason = 'Email format is valid (advanced validation unavailable)';
    return result;
  }
}

/**
 * Quick email validation for real-time feedback
 * @param {string} email 
 * @returns {object} Quick validation result
 */
function quickValidateEmail(email) {
  const result = {
    valid: false,
    reason: ''
  };

  if (!email) {
    result.reason = 'Email is required';
    return result;
  }

  if (!isValidEmailFormat(email)) {
    result.reason = 'Invalid email format';
    return result;
  }

  if (isDisposableEmail(email)) {
    result.reason = 'Disposable email addresses are not allowed';
    return result;
  }

  result.valid = true;
  result.reason = 'Email format is valid';
  return result;
}

module.exports = {
  validateEmail,
  quickValidateEmail,
  isValidEmailFormat,
  isDisposableEmail,
  isAcademicEmail
};

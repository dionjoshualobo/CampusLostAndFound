const validator = require('validator');
const { validate } = require('deep-email-validator');
const emailConfig = require('../config/emailValidationConfig');

// List of common disposable email domains to block
const disposableEmailDomains = [
  // 10-minute emails
  '10minutemail.com',
  '10minutemail.net',
  '10minutemail.co.uk',
  '10minmail.com',
  '20minutemail.com',
  '30minutemail.com',
  
  // Guerrilla Mail
  'guerrillamail.com',
  'guerrillamailblock.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.biz',
  'guerrillamail.de',
  'grr.la',
  'guerrillamail.info',
  'pokemail.net',
  'spam4.me',
  'sharklasers.com',
  
  // TempMail services
  'tempmail.org',
  'temp-mail.org',
  'tempmail.net',
  'temp-mail.net',
  'tempmail.plus',
  'temp-mail.io',
  'tempmailo.com',
  'tempmailaddress.com',
  'tempemail.com',
  'tempail.com',
  'tempinbox.com',
  
  // Throwaway emails
  'throwaway.email',
  'throwawaymail.com',
  'trashmail.net',
  'trashmail.com',
  'trashmail.org',
  'trashemail.com',
  'trashmail.at',
  'trashmail.de',
  
  // Mailinator and similar
  'mailinator.com',
  'mailinator.net',
  'mailinator.org',
  'mailinator2.com',
  'notmailinator.com',
  'maildrop.cc',
  'mailnesia.com',
  'mailcatch.com',
  'mailbox.in.ua',
  
  // YOPmail
  'yopmail.com',
  'yopmail.net',
  'yopmail.fr',
  'yopmail.gq',
  'yom.pl',
  
  // Fake/Test domains
  'fakeinbox.com',
  'fakemail.net',
  'fake-mail.ml',
  'fakemailgenerator.com',
  '0-mail.com',
  '027168.com',
  '10mail.org',
  '123-m.com',
  'example.com',
  'test.com',
  'testing.com',
  
  // Popular temporary services
  'getnada.com',
  'harakirimail.com',
  'mohmal.com',
  'rootfest.net',
  'spamgourmet.com',
  'dispostable.com',
  'hide.biz.st',
  'mytrashmail.com',
  
  // International temporary services
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
  
  // More recent services
  'minuteinbox.com',
  'emailondeck.com',
  'tmailinator.com',
  'tempmail.ninja',
  'temp-inbox.com',
  'disposablemail.com',
  'spambox.us',
  'mailexpire.com',
  'emailtemporanea.net',
  'correotemporal.org',
  'mailtothis.com',
  'shoghlan.com',
  'anonymbox.com',
  'emailfake.com',
  'tempsky.com',
  'jetable.org',
  'sogetthis.com',
  'mailmetrash.com',
  'no-spam.ws',
  'emailproxsy.com',
  'trbvm.com',
  'spamherelots.com',
  
  ...emailConfig.ADDITIONAL_DISPOSABLE_DOMAINS
];

// Patterns that indicate suspicious/fake emails
const suspiciousPatterns = [
  // Long random strings
  /^[a-z]{15,}@/i,                          // 15+ random letters
  /^[a-z]+[0-9]{8,}@/i,                    // letters followed by 8+ numbers
  /^[0-9]{8,}[a-z]*@/i,                    // 8+ numbers followed by letters
  
  // Test/fake patterns
  /^(test|fake|dummy|sample|example)[0-9]*@/i,
  /^(temp|temporary|throw|disposable)[a-z0-9]*@/i,
  /^(spam|trash|junk|delete)[a-z0-9]*@/i,
  /^(user|admin|info|contact)[0-9]{5,}@/i,
  
  // Keyboard patterns
  /^(qwerty|asdf|zxcv|1234|abcd|password|qwertyui)[@]/i,
  /^[a-z]{1}\1{4,}@/i,                     // repeated characters (aaaaa@)
  
  // Obviously fake patterns
  /^(noreply|no-reply|donotreply)[0-9]*@/i,
  /^(blah|haha|lol|wtf|omg)[0-9]*@/i,
  /^[a-z]*fuck[a-z]*@/i,
  /^[a-z]*shit[a-z]*@/i,
  
  // Random gibberish patterns
  /^[bcdfghjklmnpqrstvwxyz]{8,}@/i,        // consonants only
  /^[aeiou]{5,}@/i,                        // vowels only
  /^[qxz]{3,}@/i,                          // unlikely letter combinations
  
  // Common bot patterns
  /^bot[0-9]*@/i,
  /^robot[0-9]*@/i,
  /^crawler[0-9]*@/i,
  
  // Multiple dots or special chars
  /\.{2,}/,                                // multiple dots
  /_{3,}/,                                 // multiple underscores
  /-{3,}/,                                 // multiple dashes
  
  // Suspicious academic fakes
  /^student[0-9]{6,}@/i,                   // student + long numbers
  /^[0-9]{10,}@.*\.edu/i                   // long student ID patterns
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

  // Check for suspicious/fake email patterns
  const suspiciousCheck = checkSuspiciousEmail(email);
  if (suspiciousCheck.isSuspicious) {
    result.reason = suspiciousCheck.reason;
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

  // Check for suspicious/fake email patterns
  const suspiciousCheck = checkSuspiciousEmail(email);
  if (suspiciousCheck.isSuspicious) {
    result.reason = suspiciousCheck.reason;
    return result;
  }

  result.valid = true;
  result.reason = 'Email format is valid';
  return result;
}

/**
 * Checks if email looks suspicious or fake
 * @param {string} email 
 * @returns {object}
 */
function checkSuspiciousEmail(email) {
  const result = { 
    isSuspicious: false, 
    reason: '',
    pattern: null
  };
  
  // Check against suspicious patterns
  for (let i = 0; i < suspiciousPatterns.length; i++) {
    const pattern = suspiciousPatterns[i];
    if (pattern.test(email)) {
      result.isSuspicious = true;
      result.pattern = pattern.toString();
      
      // Provide specific reasons based on pattern type
      if (pattern.toString().includes('15,')) {
        result.reason = 'Email appears to contain random character sequence';
      } else if (pattern.toString().includes('8,')) {
        result.reason = 'Email appears to be auto-generated';
      } else if (pattern.toString().includes('test|fake|dummy')) {
        result.reason = 'Test or fake email addresses are not allowed';
      } else if (pattern.toString().includes('temp|temporary')) {
        result.reason = 'Temporary email addresses are not allowed';
      } else if (pattern.toString().includes('spam|trash|junk')) {
        result.reason = 'Spam or trash email addresses are not allowed';
      } else if (pattern.toString().includes('qwerty|asdf')) {
        result.reason = 'Keyboard pattern email addresses are not allowed';
      } else if (pattern.toString().includes('noreply|no-reply')) {
        result.reason = 'No-reply email addresses cannot be used for registration';
      } else if (pattern.toString().includes('bot|robot|crawler')) {
        result.reason = 'Bot email addresses are not allowed';
      } else {
        result.reason = 'Email appears to be invalid or fake';
      }
      break;
    }
  }
  
  return result;
}

module.exports = {
  validateEmail,
  quickValidateEmail,
  isValidEmailFormat,
  isDisposableEmail,
  isAcademicEmail,
  checkSuspiciousEmail
};

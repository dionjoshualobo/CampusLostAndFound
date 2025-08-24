# Email Validation Feature

This feature adds comprehensive email validation to the Campus Lost and Found application to ensure only real, valid email addresses can be used for registration.

## Features

### 🔍 Real-time Email Validation
- **Instant feedback** as users type their email address
- **Visual indicators** showing validation status (valid/invalid/checking)
- **Helpful suggestions** for common typos

### 🛡️ Comprehensive Validation Layers

1. **Format Validation**: Basic email format checking using regex
2. **Disposable Email Detection**: Blocks temporary/throwaway email services
3. **Domain Validation**: Checks if the email domain actually exists (MX record lookup)
4. **Typo Detection**: Suggests corrections for common email mistakes
5. **Academic Email Support**: Optional enforcement of college/university emails

### 🚫 Blocked Email Types
- Disposable email services (10minutemail, guerrillamail, tempmail, etc.)
- Invalid email formats
- Non-existent domains
- Emails with detected typos (with suggestions)

## Configuration

### Server Configuration
Edit `/src/server/config/emailValidationConfig.js`:

```javascript
module.exports = {
  // Set to true to enforce academic emails only
  CAMPUS_ONLY_MODE: false,
  
  // Academic email domains for your campus
  CAMPUS_EMAIL_DOMAINS: [
    'youruniversity.edu',
    'college.ac.in',
    'students.youruniversity.edu'
  ],
  
  // Additional disposable email domains specific to your region
  ADDITIONAL_DISPOSABLE_DOMAINS: [
    'regional-temp-mail.com'
  ],
  
  // Email validation settings
  VALIDATION_SETTINGS: {
    CHECK_MX_RECORDS: true,
    CHECK_TYPOS: true,
    CHECK_DISPOSABLE: true,
    VALIDATION_TIMEOUT: 5000
  }
};
```

### Campus-Only Mode
To enforce academic emails only:
1. Set `CAMPUS_ONLY_MODE: true` in the config
2. Add your university domains to `CAMPUS_EMAIL_DOMAINS`

## API Endpoints

### POST /api/auth/validate-email
Validates an email address in real-time.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "valid": true,
  "message": "Valid email address",
  "suggestions": [],
  "isAcademic": false
}
```

### Enhanced Registration
The existing `/api/auth/register` endpoint now includes automatic email validation before user creation.

## Implementation Details

### Backend
- **Email Validator Utility** (`/src/server/utils/emailValidator.js`)
- **Enhanced Auth Routes** with validation endpoints
- **Configuration-driven** validation rules

### Frontend
- **Real-time validation** with debounced API calls
- **Visual feedback** with Bootstrap validation classes
- **Spinner indicators** during validation
- **Suggestion display** for typos and improvements

### Dependencies
- `validator`: Basic email format validation
- `deep-email-validator`: Advanced validation (MX records, disposable detection)

## User Experience

### Registration Flow
1. User types email address
2. Real-time validation occurs after 500ms delay
3. Visual feedback shows:
   - ✅ Green checkmark for valid emails
   - ❌ Red X for invalid emails
   - 🔄 Spinner while checking
   - 💡 Suggestions for improvements

### Error Messages
- **Invalid format**: "Invalid email format"
- **Disposable email**: "Disposable email addresses are not allowed"
- **Domain doesn't exist**: "Email domain does not exist"
- **Campus-only**: "Please use your official college/university email address"
- **Already registered**: "Email address is already registered"

## Benefits

### For Users
- **No email verification emails needed** (bypasses Supabase 2-email limit)
- **Immediate feedback** prevents submission errors
- **Helpful suggestions** for typos
- **Clear error messages** explain what's wrong

### For Administrators
- **Prevents fake registrations** with invalid emails
- **Blocks disposable emails** reducing spam accounts
- **Configurable rules** for different campus requirements
- **No email delivery dependencies** for basic validation

## Testing

Run the email validation test:
```bash
cd src/server
node test-email-validation.js
```

This will test various email scenarios and show validation results.

## Limitations

1. **MX Record Validation**: May not work in environments with restricted network access
2. **Academic Email Detection**: Based on patterns, may not catch all academic domains
3. **API Dependencies**: Deep validation requires internet connectivity

## Future Enhancements

- Integration with institutional email verification systems
- Custom validation rules per campus
- Whitelist/blacklist management interface
- Bulk email validation for admin imports

const { validateEmail, quickValidateEmail } = require('./utils/emailValidator');

async function testEmailValidation() {
  console.log('=== Email Validation Testing ===\n');

  const testEmails = [
    'valid@gmail.com',
    'invalid-email',
    'test@10minutemail.com', // disposable
    'student@college.edu', // academic
    'user@nonexistentdomain12345.com',
    'test@',
    '',
    'test@tempmail.org' // disposable
  ];

  for (const email of testEmails) {
    console.log(`Testing: "${email}"`);
    
    // Quick validation
    const quickResult = quickValidateEmail(email);
    console.log(`  Quick validation: ${quickResult.valid ? '✅' : '❌'} - ${quickResult.reason}`);
    
    // Full validation
    try {
      const fullResult = await validateEmail(email);
      console.log(`  Full validation: ${fullResult.valid ? '✅' : '❌'} - ${fullResult.reason}`);
      if (fullResult.suggestions && fullResult.suggestions.length > 0) {
        console.log(`  Suggestions: ${fullResult.suggestions.join(', ')}`);
      }
      if (fullResult.isAcademic) {
        console.log(`  🎓 Academic email detected`);
      }
    } catch (error) {
      console.log(`  Full validation failed: ${error.message}`);
    }
    
    console.log('');
  }
}

// Run the test
testEmailValidation().catch(console.error);

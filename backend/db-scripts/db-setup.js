const { execSync } = require('child_process');
const path = require('path');

console.log('=== Database Setup and Validation ===');

// Helper function to run scripts
function runScript(scriptName) {
  console.log(`\n>>> Running ${scriptName}...\n`);
  try {
    execSync(`node ${path.join(__dirname, scriptName)}`, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error running ${scriptName}:`, error.message);
    return false;
  }
}

// First check connection
if (!runScript('check-db.js')) {
  console.error('Database connection failed. Aborting setup.');
  process.exit(1);
}

// Then run all setup scripts in order
const scripts = [
  'fix-schema.js',
  'fix-db.js',
  'fix-status-enum.js',
  'notification-schema.js',
  'validate-db.js'
];

scripts.forEach(script => {
  runScript(script);
});

console.log('\n=== Database setup completed ===');

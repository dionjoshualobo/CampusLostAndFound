require('dotenv').config({ path: './.env' });
const { Client } = require('pg');

console.log('Testing Supabase connection...');
console.log('DATABASE_URL from env:', process.env.DATABASE_URL ? 'Set' : 'Not set');

// Test different connection string formats
const connectionStrings = [
  // Original from .env
  process.env.DATABASE_URL,
  
  // Standard Supabase format
  'postgresql://postgres:[password]@db.sqnngwnxbnjwlxyutqmo.supabase.co:5432/postgres',
  
  // Pooler connection
  'postgresql://postgres.sqnngwnxbnjwlxyutqmo:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres'
];

async function testConnection(connectionString, name) {
  console.log(`\n--- Testing ${name} ---`);
  
  if (!connectionString) {
    console.log('Connection string is undefined');
    return false;
  }
  
  // Mask password in log
  const maskedConnectionString = connectionString.replace(/:([^@]+)@/, ':***@');
  console.log('Connection string:', maskedConnectionString);
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connection successful!');
    
    // Test a simple query
    const result = await client.query('SELECT version()');
    console.log('PostgreSQL version:', result.rows[0].version.substring(0, 50) + '...');
    
    await client.end();
    return true;
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    await client.end().catch(() => {}); // Ignore errors when closing
    return false;
  }
}

async function runTests() {
  console.log('=== Supabase Connection Test ===\n');
  
  const tests = [
    ['Environment DATABASE_URL', connectionStrings[0]],
    ['Standard Supabase Format', connectionStrings[1]],
    ['Pooler Connection', connectionStrings[2]]
  ];
  
  for (const [name, connectionString] of tests) {
    const success = await testConnection(connectionString, name);
    if (success) {
      console.log(`\n🎉 ${name} works! Use this connection string.`);
      break;
    }
  }
  
  console.log('\n=== Test Complete ===');
  console.log('\nIf none of the connections worked:');
  console.log('1. Check your Supabase project is active');
  console.log('2. Verify your database password');
  console.log('3. Check your project reference ID');
  console.log('4. Ensure your IP is allowed in Supabase settings');
}

runTests();

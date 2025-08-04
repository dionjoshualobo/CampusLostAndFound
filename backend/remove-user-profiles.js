const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

async function removeUserProfilesTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    const client = await pool.connect();
    
    console.log('🗑️  Removing unnecessary user_profiles table...');
    
    // Drop the user_profiles table
    await client.query('DROP TABLE IF EXISTS user_profiles CASCADE');
    
    console.log('✅ user_profiles table has been removed');
    
    // Verify it's gone
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\nRemaining tables:');
    tablesResult.rows.forEach(row => console.log('  -', row.table_name));
    
    client.release();
  } catch (error) {
    console.error('❌ Error removing table:', error.message);
  } finally {
    await pool.end();
  }
}

removeUserProfilesTable();

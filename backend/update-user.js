const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

async function updateExistingUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    const client = await pool.connect();
    
    console.log('Updating existing user with sample profile data...');
    
    // Update the existing user with sample data
    await client.query(`
      UPDATE users 
      SET usertype = $1, department = $2, semester = $3, contactinfo = $4 
      WHERE email = $5
    `, ['student', 'CSE', 3, '9876543210', 'dionlobo2005@gmail.com']);
    
    console.log('✅ User updated successfully');
    
    // Verify the update
    const result = await client.query(`
      SELECT id, name, email, usertype, department, semester, contactinfo 
      FROM users WHERE email = $1
    `, ['dionlobo2005@gmail.com']);
    
    console.log('Updated user data:');
    console.log(result.rows[0]);
    
    client.release();
  } catch (error) {
    console.error('❌ Error updating user:', error.message);
  } finally {
    await pool.end();
  }
}

updateExistingUser();

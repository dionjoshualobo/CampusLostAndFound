require('dotenv').config({ path: './.env' });
const { Client } = require('pg');

async function checkConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  console.log('Attempting to connect to PostgreSQL database...');

  try {
    await client.connect();
    console.log('Connection successful!');
    
    // Check if tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables in database:', result.rows.map(t => t.table_name));
    
    await client.end();
  } catch (error) {
    console.error('Connection failed:', error);
  }
}

checkConnection();
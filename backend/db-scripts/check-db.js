require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

async function checkConnection() {
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  };

  console.log('Attempting to connect with config:', {
    host: config.host,
    user: config.user,
    database: config.database
  });

  try {
    const connection = await mysql.createConnection(config);
    console.log('Connection successful!');
    
    // Check if tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tables in database:', tables.map(t => Object.values(t)[0]));
    
    await connection.end();
  } catch (error) {
    console.error('Connection failed:', error);
  }
}

checkConnection();
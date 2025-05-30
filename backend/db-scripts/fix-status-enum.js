require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

async function fixStatusEnum() {
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  };

  console.log('Fixing status ENUM in items table...');

  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('Connection successful!');
    
    // Check current ENUM values
    const [columns] = await connection.execute(`SHOW COLUMNS FROM items LIKE 'status'`);
    console.log('Current status column definition:', columns[0].Type);
    
    // Modify the column to include 'resolved' if it's missing
    await connection.execute(`
      ALTER TABLE items 
      MODIFY COLUMN status ENUM('lost', 'found', 'claimed', 'resolved') NOT NULL
    `);
    
    console.log('Status ENUM updated successfully');
    
    // Verify the change
    const [updatedColumns] = await connection.execute(`SHOW COLUMNS FROM items LIKE 'status'`);
    console.log('New status column definition:', updatedColumns[0].Type);
    
  } catch (error) {
    console.error('Error fixing status ENUM:', error);
  } finally {
    if (connection) await connection.end();
  }
}

fixStatusEnum();
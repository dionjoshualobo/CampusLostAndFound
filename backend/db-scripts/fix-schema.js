require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

async function updateUserSchema() {
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  };

  console.log('Updating user table schema...');

  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('Connection successful!');
    
    // Check if userType column exists
    const [userTypeColumn] = await connection.execute(`SHOW COLUMNS FROM users LIKE 'userType'`);
    if (userTypeColumn.length === 0) {
      console.log('Adding userType column to users table');
      await connection.execute(`ALTER TABLE users ADD COLUMN userType ENUM('student', 'faculty') DEFAULT 'student'`);
    }
    
    // Check if department column exists
    const [departmentColumn] = await connection.execute(`SHOW COLUMNS FROM users LIKE 'department'`);
    if (departmentColumn.length === 0) {
      console.log('Adding department column to users table');
      await connection.execute(`ALTER TABLE users ADD COLUMN department VARCHAR(100)`);
    }
    
    // Check if semester column exists
    const [semesterColumn] = await connection.execute(`SHOW COLUMNS FROM users LIKE 'semester'`);
    if (semesterColumn.length === 0) {
      console.log('Adding semester column to users table');
      await connection.execute(`ALTER TABLE users ADD COLUMN semester INT`);
    }
    
    console.log('User schema updated successfully');
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    if (connection) await connection.end();
  }
}

updateUserSchema();
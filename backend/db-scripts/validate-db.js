require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

async function validateDatabase() {
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  };

  console.log('Starting comprehensive database validation...');
  let connection;

  try {
    connection = await mysql.createConnection(config);
    console.log('Connection successful!');
    
    // 1. Check if all required tables exist
    const requiredTables = ['users', 'items', 'categories', 'comments', 'notifications'];
    const [tables] = await connection.execute('SHOW TABLES');
    const existingTables = tables.map(t => Object.values(t)[0]);
    
    console.log('Existing tables:', existingTables.join(', '));
    
    // Check each table structure
    for (const table of requiredTables) {
      if (!existingTables.includes(table)) {
        console.error(`Table ${table} is missing!`);
        continue;
      }
      
      // Get table columns
      const [columns] = await connection.execute(`DESCRIBE ${table}`);
      console.log(`\nTable ${table} structure:`);
      columns.forEach(col => console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''}`));
      
      // Table-specific validation
      if (table === 'users') {
        await validateUsersTable(connection);
      } else if (table === 'items') {
        await validateItemsTable(connection);
      } else if (table === 'notifications') {
        await validateNotificationsTable(connection);
      }
    }
    
    console.log('\nDatabase validation completed');
  } catch (error) {
    console.error('Validation error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

async function validateUsersTable(connection) {
  console.log('\nValidating users table...');
  
  // Check for required columns in users table
  const requiredColumns = [
    { name: 'id', type: 'INT', null: false },
    { name: 'name', type: 'VARCHAR', null: false },
    { name: 'email', type: 'VARCHAR', null: false },
    { name: 'passwordHash', type: 'VARCHAR', null: false },
    { name: 'userType', type: 'ENUM', null: true },
    { name: 'department', type: 'VARCHAR', null: true },
    { name: 'semester', type: 'INT', null: true },
    { name: 'contactInfo', type: 'VARCHAR', null: true }
  ];
  
  // Fix any missing columns
  for (const col of requiredColumns) {
    const [colExists] = await connection.execute(`SHOW COLUMNS FROM users LIKE '${col.name}'`);
    
    if (colExists.length === 0) {
      console.log(`Missing column ${col.name} in users table, adding it...`);
      
      if (col.name === 'userType') {
        await connection.execute(`ALTER TABLE users ADD COLUMN ${col.name} ENUM('student', 'faculty') DEFAULT 'student'`);
      } else if (col.name === 'semester') {
        await connection.execute(`ALTER TABLE users ADD COLUMN ${col.name} INT NULL`);
      } else if (col.name === 'department') {
        await connection.execute(`ALTER TABLE users ADD COLUMN ${col.name} VARCHAR(100) NULL`);
      } else if (col.name === 'contactInfo') {
        await connection.execute(`ALTER TABLE users ADD COLUMN ${col.name} VARCHAR(255) NULL`);
      }
      
      console.log(`Added column ${col.name} successfully`);
    }
  }
  
  console.log('Users table validation complete');
}

async function validateItemsTable(connection) {
  console.log('\nValidating items table...');
  
  // Check for required columns in items table
  const requiredColumns = [
    { name: 'claimedBy', type: 'INT', null: true },
    { name: 'claimedAt', type: 'TIMESTAMP', null: true }
  ];
  
  // Fix any missing columns
  for (const col of requiredColumns) {
    const [colExists] = await connection.execute(`SHOW COLUMNS FROM items LIKE '${col.name}'`);
    
    if (colExists.length === 0) {
      console.log(`Missing column ${col.name} in items table, adding it...`);
      
      if (col.name === 'claimedBy') {
        await connection.execute(`
          ALTER TABLE items 
          ADD COLUMN ${col.name} INT NULL,
          ADD FOREIGN KEY (${col.name}) REFERENCES users(id) ON DELETE SET NULL
        `);
      } else if (col.name === 'claimedAt') {
        await connection.execute(`ALTER TABLE items ADD COLUMN ${col.name} TIMESTAMP NULL`);
      }
      
      console.log(`Added column ${col.name} successfully`);
    }
  }
  
  console.log('Items table validation complete');
}

async function validateNotificationsTable(connection) {
  console.log('\nValidating notifications table...');
  
  // Check if notifications table exists, create if not
  const [tableExists] = await connection.execute(`SHOW TABLES LIKE 'notifications'`);
  
  if (tableExists.length === 0) {
    console.log('Notifications table does not exist, creating it...');
    
    await connection.execute(`
      CREATE TABLE notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        senderId INT NOT NULL,
        itemId INT NOT NULL,
        message TEXT NOT NULL,
        isRead BOOLEAN DEFAULT false,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Created notifications table successfully');
  } else {
    console.log('Notifications table exists');
  }
  
  console.log('Notifications table validation complete');
}

validateDatabase();
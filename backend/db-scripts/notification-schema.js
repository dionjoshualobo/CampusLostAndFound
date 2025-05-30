require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

async function createNotificationsTable() {
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  };

  console.log('Creating notifications table...');

  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('Connection successful!');
    
    // Create notifications table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
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
    
    console.log('Notifications table created successfully');
  } catch (error) {
    console.error('Error creating notifications table:', error);
  } finally {
    if (connection) await connection.end();
  }
}

createNotificationsTable();
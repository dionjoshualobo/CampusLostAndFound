const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create tables if they don't exist
const initDb = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Connected to database successfully');
    
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        passwordHash VARCHAR(255) NOT NULL,
        userType ENUM('student', 'faculty') DEFAULT 'student',
        department VARCHAR(100),
        semester INT,
        contactInfo VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create categories table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
      )
    `);
    
    // Insert default categories
    await connection.execute(`
      INSERT IGNORE INTO categories (name) VALUES 
      ('Electronics'), 
      ('Clothing'), 
      ('Books'), 
      ('Personal Items'), 
      ('Keys'), 
      ('Bags'), 
      ('Documents'), 
      ('Other')
    `);
    
    // Create items table with category and status
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        status ENUM('lost', 'found', 'claimed', 'resolved') NOT NULL,
        location VARCHAR(255),
        dateLost DATE,
        categoryId INT,
        userId INT,
        claimedBy INT,
        claimedAt TIMESTAMP NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (claimedBy) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    // Create comments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        itemId INT NOT NULL,
        userId INT NOT NULL,
        content TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);
    
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
    
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1); // Exit if database initialization fails
  } finally {
    if (connection) connection.release();
  }
};

// Initialize the database
initDb();

module.exports = pool;

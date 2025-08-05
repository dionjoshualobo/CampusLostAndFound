const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Create tables if they don't exist
const initDb = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('Connected to database successfully');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        passwordhash VARCHAR(255) NOT NULL,
        usertype VARCHAR(20) DEFAULT 'student' CHECK (usertype IN ('student', 'faculty')),
        department VARCHAR(100),
        semester INTEGER,
        contactinfo VARCHAR(255),
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
      )
    `);
    
    // Insert default categories
    await client.query(`
      INSERT INTO categories (name) VALUES 
      ('Electronics'), 
      ('Clothing'), 
      ('Books'), 
      ('Personal Items'), 
      ('Keys'), 
      ('Bags'), 
      ('Documents'), 
      ('Other')
      ON CONFLICT (name) DO NOTHING
    `);
    
    // Create items table with category and status
    await client.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        status VARCHAR(20) NOT NULL CHECK (status IN ('lost', 'found', 'claimed', 'resolved')),
        location VARCHAR(255),
        datelost DATE,
        categoryid INTEGER,
        userid INTEGER,
        claimedby INTEGER,
        claimedat TIMESTAMP NULL,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userid) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (categoryid) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (claimedby) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    // Create comments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        itemid INTEGER NOT NULL,
        userid INTEGER NOT NULL,
        content TEXT NOT NULL,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (itemid) REFERENCES items(id) ON DELETE CASCADE,
        FOREIGN KEY (userid) REFERENCES users(id)
      )
    `);
    
    // Create notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        userid INTEGER NOT NULL,
        senderid INTEGER NOT NULL,
        itemid INTEGER NOT NULL,
        message TEXT NOT NULL,
        isread BOOLEAN DEFAULT false,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (senderid) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (itemid) REFERENCES items(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1); // Exit if database initialization fails
  } finally {
    if (client) client.release();
  }
};

// Initialize the database
initDb();

module.exports = pool;

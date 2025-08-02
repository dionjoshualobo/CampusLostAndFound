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
    
    // Create user_profiles table with quoted identifiers to preserve case
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100),
        "userType" VARCHAR(20) DEFAULT 'student' CHECK ("userType" IN ('student', 'faculty')),
        department VARCHAR(100),
        semester INTEGER,
        "contactInfo" VARCHAR(255),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        dateLost DATE,
        categoryId INTEGER,
        userId UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
        claimedBy UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
        claimedAt TIMESTAMP NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);
    
    // Create comments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        itemId INTEGER NOT NULL,
        userId UUID NOT NULL REFERENCES user_profiles(id),
        content TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE
      )
    `);
    
    // Create notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        userId UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
        senderId UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
        itemId INTEGER NOT NULL,
        message TEXT NOT NULL,
        isRead BOOLEAN DEFAULT false,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE
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

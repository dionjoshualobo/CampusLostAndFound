require('dotenv').config({ path: './.env' });
const { Client } = require('pg');

async function validateDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  console.log('Starting comprehensive database validation...');

  try {
    await client.connect();
    console.log('Connection successful!');
    
    // 1. Check if all required tables exist
    const requiredTables = ['users', 'items', 'categories', 'comments', 'notifications'];
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const existingTables = result.rows.map(t => t.table_name);
    
    console.log('Existing tables:', existingTables.join(', '));
    
    // Check each table structure
    for (const table of requiredTables) {
      if (!existingTables.includes(table)) {
        console.error(`Table ${table} is missing!`);
        continue;
      }
      
      // Get table columns
      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table]);
      
      console.log(`\nTable ${table} structure:`);
      columnsResult.rows.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
      
      // Table-specific validation
      if (table === 'users') {
        await validateUsersTable(client);
      } else if (table === 'items') {
        await validateItemsTable(client);
      } else if (table === 'notifications') {
        await validateNotificationsTable(client);
      }
    }
    
    console.log('\nDatabase validation completed');
  } catch (error) {
    console.error('Validation error:', error);
  } finally {
    await client.end();
  }
}

async function validateUsersTable(client) {
  try {
    const result = await client.query('SELECT COUNT(*) as count FROM users');
    console.log(`Users table has ${result.rows[0].count} records`);
    
    // Check for required columns
    const requiredColumns = ['id', 'name', 'email', 'passwordhash'];
    for (const column of requiredColumns) {
      try {
        await client.query(`SELECT ${column} FROM users LIMIT 1`);
        console.log(`✓ Column ${column} exists`);
      } catch (err) {
        console.log(`✗ Column ${column} missing or inaccessible`);
      }
    }
  } catch (error) {
    console.error('Users table validation error:', error);
  }
}

async function validateItemsTable(client) {
  try {
    const result = await client.query('SELECT COUNT(*) as count FROM items');
    console.log(`Items table has ${result.rows[0].count} records`);
    
    // Check for required columns
    const requiredColumns = ['id', 'title', 'status', 'userid'];
    for (const column of requiredColumns) {
      try {
        await client.query(`SELECT ${column} FROM items LIMIT 1`);
        console.log(`✓ Column ${column} exists`);
      } catch (err) {
        console.log(`✗ Column ${column} missing or inaccessible`);
      }
    }
    
    // Check status values
    const statusResult = await client.query('SELECT DISTINCT status FROM items');
    console.log('Status values found:', statusResult.rows.map(r => r.status).join(', '));
  } catch (error) {
    console.error('Items table validation error:', error);
  }
}

async function validateNotificationsTable(client) {
  try {
    const result = await client.query('SELECT COUNT(*) as count FROM notifications');
    console.log(`Notifications table has ${result.rows[0].count} records`);
  } catch (error) {
    console.error('Notifications table validation error:', error);
  }
}

// Run validation
validateDatabase();

require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

async function fixDatabase() {
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  };

  console.log('Attempting to fix database schema...');

  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('Connection successful!');
    
    // Check if categoryId column exists in items table
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM items LIKE 'categoryId'
    `);
    
    if (columns.length === 0) {
      console.log('categoryId column missing, adding it now...');
      
      // Add the categoryId column
      await connection.execute(`
        ALTER TABLE items 
        ADD COLUMN categoryId INT,
        ADD FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
      `);
      
      console.log('Successfully added categoryId column to items table');
    } else {
      console.log('categoryId column already exists');
    }
    
    // Check for other required columns
    const requiredColumns = ['claimedBy', 'claimedAt'];
    for (const column of requiredColumns) {
      const [columnExists] = await connection.execute(`SHOW COLUMNS FROM items LIKE '${column}'`);
      
      if (columnExists.length === 0) {
        console.log(`${column} column missing, adding it now...`);
        
        if (column === 'claimedBy') {
          await connection.execute(`
            ALTER TABLE items 
            ADD COLUMN claimedBy INT,
            ADD FOREIGN KEY (claimedBy) REFERENCES users(id) ON DELETE SET NULL
          `);
        } else if (column === 'claimedAt') {
          await connection.execute(`
            ALTER TABLE items 
            ADD COLUMN claimedAt TIMESTAMP NULL
          `);
        }
        
        console.log(`Successfully added ${column} column to items table`);
      } else {
        console.log(`${column} column already exists`);
      }
    }

    // Verify table structure
    const [tableInfo] = await connection.execute('DESCRIBE items');
    console.log('Current items table structure:');
    tableInfo.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type}`);
    });
    
    console.log('Database schema fix completed');
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    if (connection) await connection.end();
  }
}

fixDatabase();
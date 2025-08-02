const { Client } = require('pg');
require('dotenv').config();

async function migrateUserProfilesTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database for migration...');

    // Check if we need to migrate columns
    const columnsResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_profiles' 
      ORDER BY ordinal_position
    `);
    
    console.log('Current columns:', columnsResult.rows);

    // Add missing columns if they don't exist with proper case
    const columns = columnsResult.rows.map(row => row.column_name);
    
    if (!columns.includes('userType') && !columns.includes('usertype')) {
      console.log('Adding userType column...');
      await client.query(`
        ALTER TABLE user_profiles 
        ADD COLUMN "userType" VARCHAR(20) DEFAULT 'student' 
        CHECK ("userType" IN ('student', 'faculty'))
      `);
    }
    
    if (!columns.includes('contactInfo') && !columns.includes('contactinfo')) {
      console.log('Adding contactInfo column...');
      await client.query(`
        ALTER TABLE user_profiles 
        ADD COLUMN "contactInfo" VARCHAR(255)
      `);
    }
    
    if (!columns.includes('department')) {
      console.log('Adding department column...');
      await client.query(`
        ALTER TABLE user_profiles 
        ADD COLUMN department VARCHAR(100)
      `);
    }
    
    if (!columns.includes('semester')) {
      console.log('Adding semester column...');
      await client.query(`
        ALTER TABLE user_profiles 
        ADD COLUMN semester INTEGER
      `);
    }

    // If we have lowercase columns, migrate the data
    if (columns.includes('usertype') && !columns.includes('userType')) {
      console.log('Migrating usertype to userType...');
      await client.query(`
        ALTER TABLE user_profiles 
        ADD COLUMN "userType" VARCHAR(20) DEFAULT 'student' 
        CHECK ("userType" IN ('student', 'faculty'))
      `);
      await client.query(`
        UPDATE user_profiles 
        SET "userType" = usertype 
        WHERE usertype IS NOT NULL
      `);
      await client.query('ALTER TABLE user_profiles DROP COLUMN usertype');
    }
    
    if (columns.includes('contactinfo') && !columns.includes('contactInfo')) {
      console.log('Migrating contactinfo to contactInfo...');
      await client.query(`
        ALTER TABLE user_profiles 
        ADD COLUMN "contactInfo" VARCHAR(255)
      `);
      await client.query(`
        UPDATE user_profiles 
        SET "contactInfo" = contactinfo 
        WHERE contactinfo IS NOT NULL
      `);
      await client.query('ALTER TABLE user_profiles DROP COLUMN contactinfo');
    }

    // Check final structure
    const finalResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_profiles' 
      ORDER BY ordinal_position
    `);
    
    console.log('Final columns:', finalResult.rows);
    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await client.end();
  }
}

migrateUserProfilesTable();

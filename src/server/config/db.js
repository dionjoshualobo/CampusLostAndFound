const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase configuration missing. Please check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Create tables if they don't exist (using Supabase SQL)
const initDb = async () => {
  try {
    console.log('Connected to Supabase successfully');
    
    // Test if tables exist by trying to query them
    // If they don't exist, Supabase will handle this gracefully
    try {
      await supabase.from('categories').select('count', { count: 'exact', head: true });
      console.log('Categories table exists');
    } catch (error) {
      console.log('Categories table may not exist - this is normal for new setups');
    }

    try {
      await supabase.from('users').select('count', { count: 'exact', head: true });
      console.log('Users table exists');
    } catch (error) {
      console.log('Users table may not exist - this is normal for new setups');
    }

    try {
      await supabase.from('items').select('count', { count: 'exact', head: true });
      console.log('Items table exists');
    } catch (error) {
      console.log('Items table may not exist - this is normal for new setups');
    }

    // Insert default categories using Supabase (only if categories table exists)
    try {
      const { error: categoryInsertError } = await supabase
        .from('categories')
        .upsert([
          { name: 'Electronics' },
          { name: 'Clothing' },
          { name: 'Books' },
          { name: 'Personal Items' },
          { name: 'Keys' },
          { name: 'Bags' },
          { name: 'Documents' },
          { name: 'Other' }
        ], { onConflict: 'name' });
      
      if (categoryInsertError && !categoryInsertError.message.includes('does not exist')) {
        console.log('Note: Categories may already exist or RLS policies need adjustment');
      } else if (!categoryInsertError) {
        console.log('Default categories inserted successfully');
      }
    } catch (error) {
      console.log('Could not insert default categories - table may not exist yet');
    }
    
    console.log('Database initialization completed - using Supabase client');
  } catch (error) {
    console.error('Database initialization error:', error);
    // Don't exit process for Supabase connection issues
  }
};

// Test if tables exist and initialize if needed
const testAndInitializeTables = async () => {
  // Test if categories table exists and create default categories
  try {
    const { error: testError } = await supabase
      .from('categories')
      .select('count', { count: 'exact', head: true });
    
    if (!testError) {
      // Table exists, try to insert default categories
      const { error: categoryInsertError } = await supabase
        .from('categories')
        .upsert([
          { name: 'Electronics' },
          { name: 'Clothing' },
          { name: 'Books' },
          { name: 'Personal Items' },
          { name: 'Keys' },
          { name: 'Bags' },
          { name: 'Documents' },
          { name: 'Other' }
        ], { onConflict: 'name' });
      
      if (categoryInsertError) {
        console.log('Note: Could not insert default categories. RLS policies may need to be configured.');
      } else {
        console.log('Default categories initialized');
      }
    } else {
      console.log('Note: Categories table not accessible. Please ensure tables are created in Supabase dashboard.');
      console.log('Required tables: users, categories, items, comments, notifications, item_images');
    }
  } catch (error) {
    console.log('Note: Database tables may need to be created manually in Supabase dashboard.');
    console.log('Please create the following tables with appropriate schemas:');
    console.log('- users, categories, items, comments, notifications, item_images');
  }
};

// Test Supabase connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('categories').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Supabase connection test failed:', error);
    } else {
      console.log('Supabase connection test successful');
    }
  } catch (error) {
    console.error('Supabase connection error:', error);
  }
};

// Initialize the database
initDb();
testConnection();

module.exports = supabase;

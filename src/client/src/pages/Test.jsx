import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const Test = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing direct Supabase connection...');
        
        // Test categories
        const { data: categories, error: catError } = await supabase
          .from('categories')
          .select('*');
          
        if (catError) {
          console.error('Categories error:', catError);
          setError(`Categories error: ${catError.message}`);
          return;
        }
        
        console.log('Categories success:', categories);
        
        // Test items
        const { data: items, error: itemError } = await supabase
          .from('items')
          .select('*');
          
        if (itemError) {
          console.error('Items error:', itemError);
          setError(`Items error: ${itemError.message}`);
          return;
        }
        
        console.log('Items success:', items);
        setData({ categories, items });
        
      } catch (err) {
        console.error('Test error:', err);
        setError(`Test error: ${err.message}`);
      }
    };
    
    testConnection();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Supabase Connection Test</h2>
      
      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {data && (
        <div>
          <div className="alert alert-success">
            <strong>Success!</strong> Connected to Supabase
          </div>
          
          <h3>Categories ({data.categories?.length || 0})</h3>
          <pre>{JSON.stringify(data.categories, null, 2)}</pre>
          
          <h3>Items ({data.items?.length || 0})</h3>
          <pre>{JSON.stringify(data.items, null, 2)}</pre>
        </div>
      )}
      
      {!data && !error && (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default Test;

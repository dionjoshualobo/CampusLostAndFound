import { useState, useEffect } from 'react';
import { getItems, getCategories } from '../api';
import ItemCard from '../components/ItemCard';
import Dashboard from '../components/Dashboard';

const Home = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Starting to fetch data...');
        
        // Fetch items and categories in parallel
        const [itemsResponse, categoriesResponse] = await Promise.all([
          getItems(),
          getCategories()
        ]);
        
        console.log('Items response:', itemsResponse);
        console.log('Categories response:', categoriesResponse);
        
        setItems(itemsResponse.data);
        setCategories(categoriesResponse.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        console.error('Error details:', err.response, err.message);
        setError(`Failed to load data: ${err.message || 'Please try again later.'}`);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const filteredItems = items.filter(item => {
    const matchesStatusFilter = filter === 'all' || item.status === filter;
    const matchesCategoryFilter = categoryFilter === 'all' || 
                                 (item.categoryId && item.categoryId.toString() === categoryFilter);
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatusFilter && matchesCategoryFilter && matchesSearch;
  });
  
  if (isLoading) return <div>Loading items...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  
  return (
    <div>
      <h1>Campus Lost & Found</h1>
      <p className="lead">Browse through lost and found items on campus</p>
      
      <Dashboard />
      
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="col-md-4">
          <select 
            className="form-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        
        <div className="col-md-4">
          <select 
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {filteredItems.length === 0 ? (
        <div className="alert alert-info">No items found.</div>
      ) : (
        <div className="row">
          {filteredItems.map(item => (
            <div key={item.id} className="col-md-6 col-lg-4 mb-4">
              <ItemCard item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;

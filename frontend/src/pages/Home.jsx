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
        // Fetch items and categories in parallel
        const [itemsResponse, categoriesResponse] = await Promise.all([
          getItems(),
          getCategories()
        ]);
        
        setItems(itemsResponse.data);
        setCategories(categoriesResponse.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
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
    <div className="space-y-6">
      <div className="hero bg-base-200 rounded-lg">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Campus Lost & Found</h1>
            <p className="py-6">Browse through lost and found items on campus</p>
          </div>
        </div>
      </div>
      
      <Dashboard />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="form-control">
          <div className="input-group">
            <input
              type="text"
              placeholder="Search items..."
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-square">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="form-control">
          <select 
            className="select select-bordered w-full"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
            <option value="claimed">Claimed</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        
        <div className="form-control">
          <select 
            className="select select-bordered w-full"
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
        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>No items found.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;

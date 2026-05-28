import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  const [sortBy, setSortBy] = useState('newest');
  const [showImagesOnly, setShowImagesOnly] = useState(false);
  
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
    const matchesImages = !showImagesOnly || (item.images && item.images.length > 0);
    
    return matchesStatusFilter && matchesCategoryFilter && matchesSearch && matchesImages;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.dateLost || 0);
    const dateB = new Date(b.createdAt || b.dateLost || 0);
    
    if (sortBy === 'oldest') {
      return dateA - dateB;
    }
    
    return dateB - dateA;
  });

  const totalItems = items.length;
  const activeItems = items.filter(item => item.status === 'lost' || item.status === 'found').length;
  const resolvedItems = items.filter(item => item.status === 'resolved').length;
  const imageItems = items.filter(item => item.images && item.images.length > 0).length;

  const categoryCounts = categories.map(category => {
    const count = items.filter(item => item.categoryId?.toString() === category.id.toString()).length;
    return { ...category, count };
  }).sort((a, b) => b.count - a.count);

  const topCategories = categoryCounts.slice(0, 5);
  const hasActiveFilters = filter !== 'all' || categoryFilter !== 'all' || searchTerm || showImagesOnly || sortBy !== 'newest';
  
  const clearFilters = () => {
    setFilter('all');
    setCategoryFilter('all');
    setSearchTerm('');
    setShowImagesOnly(false);
    setSortBy('newest');
  };
  
  if (error) return <div className="alert alert-danger">{error}</div>;
  
  return (
    <div className="d-flex flex-column gap-4">
      <section className="hero-section">
        <div className="row align-items-center hero-content gy-4">
          <div className="col-lg-7">
            <p className="text-uppercase fw-semibold text-muted mb-2">Campus community hub</p>
            <h1 className="hero-title mb-3">Find what you lost. Return what you found.</h1>
            <p className="hero-subtitle mb-4">
              Track lost and found items across campus with real-time updates, verified profiles, and photo-rich reports.
            </p>
            <div className="d-flex flex-wrap gap-2 hero-actions">
              <Link className="btn btn-primary" to="/items/new?status=lost">
                Report Lost Item
              </Link>
              <Link className="btn btn-outline-primary" to="/items/new?status=found">
                Report Found Item
              </Link>
              <a className="btn btn-outline-secondary" href="#browse">
                Browse Listings
              </a>
            </div>
            <div className="d-flex flex-wrap gap-2 mt-4">
              {topCategories.map(category => (
                <span key={category.id} className="badge bg-custom border-custom text-muted-custom">
                  {category.name} • {category.count}
                </span>
              ))}
            </div>
          </div>
          <div className="col-lg-5">
            <div className="hero-card">
              <h5 className="mb-3">Today&apos;s activity</h5>
              <div className="hero-stat">
                <div className="hero-stat-icon"><i className="bi bi-collection"></i></div>
                <div>
                  <p className="mb-0 fw-semibold">Total items</p>
                  <small className="text-muted">{isLoading ? 'Loading…' : `${totalItems} reports`}</small>
                </div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-icon"><i className="bi bi-lightning-charge"></i></div>
                <div>
                  <p className="mb-0 fw-semibold">Active cases</p>
                  <small className="text-muted">{isLoading ? 'Loading…' : `${activeItems} open items`}</small>
                </div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-icon"><i className="bi bi-image"></i></div>
                <div>
                  <p className="mb-0 fw-semibold">Photo reports</p>
                  <small className="text-muted">{isLoading ? 'Loading…' : `${imageItems} items with images`}</small>
                </div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-icon"><i className="bi bi-check2-circle"></i></div>
                <div>
                  <p className="mb-0 fw-semibold">Resolved</p>
                  <small className="text-muted">{isLoading ? 'Loading…' : `${resolvedItems} returned`}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Dashboard />
      
      <section className="filter-panel p-4" id="browse">
        <div className="row g-3 align-items-end">
          <div className="col-lg-5">
            <label className="form-label">Search</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by name, description, or location"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="col-lg-3">
            <label className="form-label">Category</label>
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
          
          <div className="col-lg-4">
            <label className="form-label">Status</label>
            <div className="d-flex flex-wrap gap-2">
              {['all', 'lost', 'found', 'resolved'].map(status => (
                <button
                  key={status}
                  className={`filter-chip ${filter === status ? 'active' : ''}`}
                  onClick={() => setFilter(status)}
                  type="button"
                >
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="row g-3 align-items-end mt-1">
          <div className="col-md-4">
            <label className="form-label">Sort by</label>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
          
          <div className="col-md-4">
            <div className="form-check form-switch mt-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="imagesOnly"
                checked={showImagesOnly}
                onChange={(e) => setShowImagesOnly(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="imagesOnly">
                Only show items with photos
              </label>
            </div>
          </div>
          
          <div className="col-md-4 d-flex justify-content-md-end">
            <button
              className="btn btn-outline-secondary mt-4"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
            >
              Clear filters
            </button>
          </div>
        </div>
      </section>
      
      <section>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
          <div>
            <h2 className="section-title">Browse latest reports</h2>
            <p className="section-subtitle">
              {sortedItems.length} items match your search
            </p>
          </div>
          <Link className="btn btn-primary" to="/items/new">
            <i className="bi bi-plus-circle me-1"></i>
            Report an Item
          </Link>
        </div>
        
        {isLoading ? (
          <div className="row g-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="col-md-6 col-lg-4">
                <div className="stats-card p-4">
                  <div className="placeholder-glow">
                    <span className="placeholder col-7"></span>
                    <span className="placeholder col-4 mt-2"></span>
                    <div className="placeholder col-10 mt-3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon mb-2">🔍</div>
            <h5>No matching items</h5>
            <p className="text-muted mb-3">
              Try adjusting your filters or be the first to report an item in this category.
            </p>
            <button className="btn btn-outline-primary" onClick={clearFilters}>
              Reset filters
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {sortedItems.map(item => (
              <div key={item.id} className="col-md-6 col-lg-4">
                <ItemCard item={item} />
              </div>
            ))}
          </div>
        )}
      </section>
      
      <Link to="/items/new" className="btn btn-primary fab-report d-lg-none">
        <i className="bi bi-plus"></i>
      </Link>
    </div>
  );
};

export default Home;

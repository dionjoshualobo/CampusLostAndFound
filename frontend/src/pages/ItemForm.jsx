import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItem, getCategories } from '../api';

const ItemForm = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'lost',
    location: '',
    dateLost: '',
    categoryId: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  const { title, description, status, location, dateLost, categoryId } = formData;
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data);
        setIsLoadingCategories(false);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
        setIsLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    
    if (!title || !status) {
      setError('Title and status are required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await createItem(formData);
      navigate('/');
    } catch (err) {
      console.error('Create item error:', err);
      setError(err.response?.data?.message || 'Failed to create item. Please try again.');
      setIsLoading(false);
    }
  };
  
  if (isLoadingCategories) return <div>Loading form...</div>;
  
  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card">
          <div className="card-body">
            <h2 className="card-title">Report {status === 'lost' ? 'Lost' : 'Found'} Item</h2>
            
            {error && <div className="alert alert-danger">{error}</div>}
            
            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <label htmlFor="status" className="form-label">Item Status</label>
                <select
                  className="form-select"
                  id="status"
                  name="status"
                  value={status}
                  onChange={onChange}
                  required
                >
                  <option value="lost">Lost Item</option>
                  <option value="found">Found Item</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label htmlFor="title" className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  name="title"
                  value={title}
                  onChange={onChange}
                  placeholder="E.g. Blue Backpack, iPhone 12, etc."
                  required
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="categoryId" className="form-label">Category</label>
                <select
                  className="form-select"
                  id="categoryId"
                  name="categoryId"
                  value={categoryId}
                  onChange={onChange}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-3">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  value={description}
                  onChange={onChange}
                  rows="3"
                  placeholder="Provide any identifying details that might help"
                ></textarea>
              </div>
              
              <div className="mb-3">
                <label htmlFor="location" className="form-label">Location</label>
                <input
                  type="text"
                  className="form-control"
                  id="location"
                  name="location"
                  value={location}
                  onChange={onChange}
                  placeholder="Where the item was lost or found"
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="dateLost" className="form-label">
                  Date {status === 'lost' ? 'Lost' : 'Found'}
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="dateLost"
                  name="dateLost"
                  value={dateLost}
                  onChange={onChange}
                />
              </div>
              
              <div className="d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemForm;

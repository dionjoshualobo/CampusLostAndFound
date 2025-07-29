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
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  const { title, description, status, location, dateLost, categoryId } = formData;
  
  // Get today's date in YYYY-MM-DD format for max date
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
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
  
  const validateForm = () => {
    const errors = {};
    
    if (!title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!location.trim()) {
      errors.location = 'Location is required';
    }
    
    if (!dateLost) {
      errors.dateLost = `Date ${status === 'lost' ? 'lost' : 'found'} is required`;
    } else if (new Date(dateLost) > new Date()) {
      errors.dateLost = 'Date cannot be in the future';
    }
    
    if (!categoryId) {
      errors.categoryId = 'Category is required';
    }
    
    return errors;
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    setValidationErrors({});
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      await createItem(formData);
      navigate('/');
    } catch (err) {
      console.error('Create item error:', err);
      if (err.response?.data?.missingFields) {
        // Handle backend validation errors
        const backendErrors = {};
        err.response.data.missingFields.forEach(field => {
          const fieldMap = {
            'Title': 'title',
            'Description': 'description',
            'Location': 'location',
            'Date': 'dateLost',
            'Category': 'categoryId'
          };
          const formField = fieldMap[field] || field.toLowerCase();
          backendErrors[formField] = `${field} is required`;
        });
        setValidationErrors(backendErrors);
      } else {
        setError(err.response?.data?.message || 'Failed to create item. Please try again.');
      }
      setIsLoading(false);
    }
  };
  
  if (isLoadingCategories) return (
    <div className="flex items-center justify-center p-8">
      <span className="loading loading-spinner loading-lg"></span>
      <span className="ml-4">Loading form...</span>
    </div>
  );
  
  return (
    <div className="flex justify-center">
      <div className="card w-full max-w-2xl bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Report {status === 'lost' ? 'Lost' : 'Found'} Item
          </h2>
          
          {error && (
            <div className="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label" htmlFor="status">
                <span className="label-text">Item Status</span>
              </label>
              <select
                className="select select-bordered w-full"
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
            
            <div className="form-control">
              <label className="label" htmlFor="title">
                <span className="label-text">Title *</span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${validationErrors.title ? 'input-error' : ''}`}
                id="title"
                name="title"
                value={title}
                onChange={onChange}
                placeholder="E.g. Blue Backpack, iPhone 12, etc."
                required
              />
              {validationErrors.title && (
                <label className="label">
                  <span className="label-text-alt text-error">{validationErrors.title}</span>
                </label>
              )}
            </div>
            
            <div className="form-control">
              <label className="label" htmlFor="categoryId">
                <span className="label-text">Category *</span>
              </label>
              <select
                className={`select select-bordered w-full ${validationErrors.categoryId ? 'select-error' : ''}`}
                id="categoryId"
                name="categoryId"
                value={categoryId}
                onChange={onChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {validationErrors.categoryId && (
                <label className="label">
                  <span className="label-text-alt text-error">{validationErrors.categoryId}</span>
                </label>
              )}
            </div>
            
            <div className="form-control">
              <label className="label" htmlFor="description">
                <span className="label-text">Description *</span>
              </label>
              <textarea
                className={`textarea textarea-bordered w-full ${validationErrors.description ? 'textarea-error' : ''}`}
                id="description"
                name="description"
                value={description}
                onChange={onChange}
                rows="3"
                placeholder="Provide any identifying details that might help"
                required
              ></textarea>
              {validationErrors.description && (
                <label className="label">
                  <span className="label-text-alt text-error">{validationErrors.description}</span>
                </label>
              )}
            </div>
            
            <div className="form-control">
              <label className="label" htmlFor="location">
                <span className="label-text">Location *</span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${validationErrors.location ? 'input-error' : ''}`}
                id="location"
                name="location"
                value={location}
                onChange={onChange}
                placeholder="Where the item was lost or found"
                required
              />
              {validationErrors.location && (
                <label className="label">
                  <span className="label-text-alt text-error">{validationErrors.location}</span>
                </label>
              )}
            </div>
            
            <div className="form-control">
              <label className="label" htmlFor="dateLost">
                <span className="label-text">
                  Date {status === 'lost' ? 'Lost' : 'Found'} *
                </span>
              </label>
              <input
                type="date"
                className={`input input-bordered w-full ${validationErrors.dateLost ? 'input-error' : ''}`}
                id="dateLost"
                name="dateLost"
                value={dateLost}
                onChange={onChange}
                max={getTodayDate()}
                required
              />
              {validationErrors.dateLost && (
                <label className="label">
                  <span className="label-text-alt text-error">{validationErrors.dateLost}</span>
                </label>
              )}
              <label className="label">
                <span className="label-text-alt">You cannot select future dates</span>
              </label>
            </div>
            
            <div className="flex justify-between gap-4 pt-4">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ItemForm;

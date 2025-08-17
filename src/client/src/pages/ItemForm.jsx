import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItem, getCategories } from '../api';
import { isProfileComplete } from '../utils/profileUtils';
import ProfileCompletionModal from '../components/ProfileCompletionModal';

const ItemForm = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'lost',
    location: '',
    dateLost: '',
    categoryId: '',
    image: null
  });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  const { title, description, status, location, dateLost, categoryId, image } = formData;
  
  // Get today's date in YYYY-MM-DD format for max date
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
  // Check profile completion on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!isProfileComplete(user)) {
      setShowProfileModal(true);
    }
  }, []);

  // Cleanup image preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);
  
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
  
  const onChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image') {
      const file = files[0];
      if (file) {
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          setValidationErrors(prev => ({
            ...prev,
            image: 'Image size must be less than 5MB'
          }));
          return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setValidationErrors(prev => ({
            ...prev,
            image: 'Please select a valid image file'
          }));
          return;
        }
        
        // Clear any previous image errors
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.image;
          return newErrors;
        });
        
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        
        setFormData(prevState => ({
          ...prevState,
          [name]: file
        }));
      }
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };
  
  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    // Reset the file input
    const fileInput = document.getElementById('image');
    if (fileInput) {
      fileInput.value = '';
    }
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
    
    // Check profile completion before submitting
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!isProfileComplete(user)) {
      setShowProfileModal(true);
      return;
    }
    
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
  
  if (isLoadingCategories) return <div>Loading form...</div>;
  
  return (
    <>
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
                  <label htmlFor="title" className="form-label">Title *</label>
                  <input
                    type="text"
                    className={`form-control ${validationErrors.title ? 'is-invalid' : ''}`}
                    id="title"
                    name="title"
                    value={title}
                    onChange={onChange}
                    placeholder="E.g. Blue Backpack, iPhone 12, etc."
                    required
                  />
                  {validationErrors.title && (
                    <div className="invalid-feedback">{validationErrors.title}</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="categoryId" className="form-label">Category *</label>
                  <select
                    className={`form-select ${validationErrors.categoryId ? 'is-invalid' : ''}`}
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
                    <div className="invalid-feedback">{validationErrors.categoryId}</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description *</label>
                  <textarea
                    className={`form-control ${validationErrors.description ? 'is-invalid' : ''}`}
                    id="description"
                    name="description"
                    value={description}
                    onChange={onChange}
                    rows="3"
                    placeholder="Provide any identifying details that might help"
                    required
                  ></textarea>
                  {validationErrors.description && (
                    <div className="invalid-feedback">{validationErrors.description}</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="location" className="form-label">Location *</label>
                  <input
                    type="text"
                    className={`form-control ${validationErrors.location ? 'is-invalid' : ''}`}
                    id="location"
                    name="location"
                    value={location}
                    onChange={onChange}
                    placeholder="Where the item was lost or found"
                    required
                  />
                  {validationErrors.location && (
                    <div className="invalid-feedback">{validationErrors.location}</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="dateLost" className="form-label">
                    Date {status === 'lost' ? 'Lost' : 'Found'} *
                  </label>
                  <input
                    type="date"
                    className={`form-control ${validationErrors.dateLost ? 'is-invalid' : ''}`}
                    id="dateLost"
                    name="dateLost"
                    value={dateLost}
                    onChange={onChange}
                    max={getTodayDate()}
                    required
                  />
                  {validationErrors.dateLost && (
                    <div className="invalid-feedback">{validationErrors.dateLost}</div>
                  )}
                  <div className="form-text">You cannot select future dates</div>
                </div>

                <div className="mb-3">
                  <label htmlFor="image" className="form-label">Image (Optional)</label>
                  <input
                    type="file"
                    className={`form-control ${validationErrors.image ? 'is-invalid' : ''}`}
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={onChange}
                  />
                  {validationErrors.image && (
                    <div className="invalid-feedback">{validationErrors.image}</div>
                  )}
                  <div className="form-text">Maximum file size: 5MB. Supported formats: JPG, PNG, GIF, etc.</div>
                  
                  {imagePreview && (
                    <div className="mt-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">Image Preview:</small>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={removeImage}
                        >
                          Remove Image
                        </button>
                      </div>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="img-thumbnail"
                        style={{ maxWidth: '200px', maxHeight: '200px' }}
                      />
                    </div>
                  )}
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
      
      <ProfileCompletionModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={JSON.parse(localStorage.getItem('user') || '{}')}
        actionDescription="report an item"
      />
    </>
  );
};

export default ItemForm;

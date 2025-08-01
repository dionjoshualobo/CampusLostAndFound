import { useState } from 'react';
import { Link } from 'react-router-dom';
import { register } from '../api';

const Register = ({ login }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { name, email, password, confirmPassword } = formData;
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear validation error for this field when user starts typing
    if (validationErrors[e.target.name]) {
      setValidationErrors({ ...validationErrors, [e.target.name]: '' });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      const response = await register({ name, email, password });
      login(response.data.token, response.data.user);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">Register</h2>
            
            {error && <div className="alert alert-danger">{error}</div>}
            
            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Name *</label>
                <input
                  type="text"
                  className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
                  id="name"
                  name="name"
                  value={name}
                  onChange={onChange}
                  required
                />
                {validationErrors.name && (
                  <div className="invalid-feedback">{validationErrors.name}</div>
                )}
              </div>
              
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email Address *</label>
                <input
                  type="email"
                  className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
                  id="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  required
                />
                {validationErrors.email && (
                  <div className="invalid-feedback">{validationErrors.email}</div>
                )}
              </div>
              
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password *</label>
                <input
                  type="password"
                  className={`form-control ${validationErrors.password ? 'is-invalid' : ''}`}
                  id="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  required
                />
                {validationErrors.password && (
                  <div className="invalid-feedback">{validationErrors.password}</div>
                )}
              </div>
              
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password *</label>
                <input
                  type="password"
                  className={`form-control ${validationErrors.confirmPassword ? 'is-invalid' : ''}`}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={onChange}
                  required
                />
                {validationErrors.confirmPassword && (
                  <div className="invalid-feedback">{validationErrors.confirmPassword}</div>
                )}
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary w-100"
                disabled={isLoading}
              >
                {isLoading ? 'Registering...' : 'Register'}
              </button>
            </form>
            
            <div className="mt-3 text-center">
              <p>Already have an account? <Link to="/login">Login</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

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
    <div className="flex justify-center">
      <div className="card w-full max-w-2xl bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl mb-6">Register</h2>
          
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
              <label className="label" htmlFor="name">
                <span className="label-text">Name *</span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${validationErrors.name ? 'input-error' : ''}`}
                id="name"
                name="name"
                value={name}
                onChange={onChange}
                required
              />
              {validationErrors.name && (
                <label className="label">
                  <span className="label-text-alt text-error">{validationErrors.name}</span>
                </label>
              )}
            </div>
            
            <div className="form-control">
              <label className="label" htmlFor="email">
                <span className="label-text">Email Address *</span>
              </label>
              <input
                type="email"
                className={`input input-bordered w-full ${validationErrors.email ? 'input-error' : ''}`}
                id="email"
                name="email"
                value={email}
                onChange={onChange}
                required
              />
              {validationErrors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{validationErrors.email}</span>
                </label>
              )}
            </div>
            
            <div className="form-control">
              <label className="label" htmlFor="password">
                <span className="label-text">Password *</span>
              </label>
              <input
                type="password"
                className={`input input-bordered w-full ${validationErrors.password ? 'input-error' : ''}`}
                id="password"
                name="password"
                value={password}
                onChange={onChange}
                required
              />
              {validationErrors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">{validationErrors.password}</span>
                </label>
              )}
            </div>
            
            <div className="form-control">
              <label className="label" htmlFor="confirmPassword">
                <span className="label-text">Confirm Password *</span>
              </label>
              <input
                type="password"
                className={`input input-bordered w-full ${validationErrors.confirmPassword ? 'input-error' : ''}`}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
                required
              />
              {validationErrors.confirmPassword && (
                <label className="label">
                  <span className="label-text-alt text-error">{validationErrors.confirmPassword}</span>
                </label>
              )}
            </div>
            
            <div className="form-control mt-6">
              <button 
                type="submit" 
                className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
          
          <div className="divider">OR</div>
          
          <div className="text-center">
            <p>Already have an account? <Link to="/login" className="link link-primary">Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

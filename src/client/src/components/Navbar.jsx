import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';
import DarkModeToggle from './DarkModeToggle';
import { isProfileComplete } from '../utils/profileUtils';

const Navbar = ({ isAuthenticated, user, logout, isDarkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const profileIncomplete = isAuthenticated && user && !isProfileComplete(user);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          🎓 Campus Lost & Found
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                <i className="bi bi-house-door me-1"></i>
                Home
              </Link>
            </li>
            {isAuthenticated && (
              <li className="nav-item">
                <Link className="nav-link" to="/items/new">
                  <i className="bi bi-plus-circle me-1"></i>
                  Report Item
                </Link>
              </li>
            )}
          </ul>
          
          <div className="d-flex align-items-center gap-2">
            <DarkModeToggle 
              isDarkMode={isDarkMode} 
              toggleDarkMode={toggleDarkMode} 
            />
            
            {isAuthenticated && <NotificationDropdown />}
            
            {isAuthenticated ? (
              <div className="dropdown">
                <button 
                  className={`btn btn-outline-primary dropdown-toggle position-relative ${profileIncomplete ? 'btn-outline-warning' : ''}`}
                  type="button" 
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle me-1"></i>
                  {user?.name || 'User'}
                  {profileIncomplete && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning">
                      !
                    </span>
                  )}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link 
                      className={`dropdown-item ${profileIncomplete ? 'text-warning fw-bold' : ''}`} 
                      to="/profile"
                    >
                      <i className="bi bi-person me-2"></i>
                      Profile {profileIncomplete && '(Incomplete)'}
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link className="btn btn-primary" to="/auth">
                  <i className="bi bi-google me-1"></i>
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

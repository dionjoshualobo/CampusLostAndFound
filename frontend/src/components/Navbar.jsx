import { Link } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ isAuthenticated, user, logout }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">Lost & Found</Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/items/new">Report Item</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">My Profile</Link>
                </li>
              </>
            )}
          </ul>
          <ul className="navbar-nav">
            {!isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Register</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NotificationDropdown />
                </li>
                <li className="nav-item">
                  <span className="nav-link">Welcome, {user?.name}</span>
                </li>
                <li className="nav-item">
                  <button 
                    className="nav-link btn btn-link" 
                    onClick={logout}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

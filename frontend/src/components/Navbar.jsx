import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';
import ThemeSelector from './ThemeSelector';

const Navbar = ({ isAuthenticated, user, logout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li><Link to="/">Home</Link></li>
            {isAuthenticated && (
              <li><Link to="/items/new">Report Item</Link></li>
            )}
          </ul>
        </div>
        <Link className="btn btn-ghost text-xl font-bold" to="/">
          🎓 Campus Lost & Found
        </Link>
      </div>
      
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li><Link to="/">Home</Link></li>
          {isAuthenticated && (
            <li><Link to="/items/new">Report Item</Link></li>
          )}
        </ul>
      </div>
      
      <div className="navbar-end gap-2">
        <ThemeSelector />
        
        {isAuthenticated ? (
          <>
            <NotificationDropdown />
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full bg-base-300 flex items-center justify-center">
                  <span className="text-base-content">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              </div>
              <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                <li className="menu-title">
                  <span>{user?.name || 'User'}</span>
                </li>
                <li><Link to="/profile">Profile</Link></li>
                <li><hr className="my-1" /></li>
                <li><button onClick={handleLogout}>Logout</button></li>
              </ul>
            </div>
          </>
        ) : (
          <div className="flex gap-2">
            <Link className="btn btn-outline btn-primary" to="/login">
              Login
            </Link>
            <Link className="btn btn-primary" to="/register">
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;

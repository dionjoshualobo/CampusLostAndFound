import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ItemForm from './pages/ItemForm';
import ItemDetails from './pages/ItemDetails';
import Profile from './pages/Profile';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is authenticated on app load
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // You could fetch user data here if needed
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
    }
    
    // Initialize theme from localStorage or default to light
    const savedTheme = localStorage.getItem('daisyui-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    setIsLoading(false);
  }, []);
  
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4 text-lg">Loading Campus Lost & Found...</p>
        </div>
      </div>
    );
  }
  
  return (
    <Router>
      <div className="App min-h-screen bg-base-100 theme-transition">
        <Navbar 
          isAuthenticated={isAuthenticated} 
          user={user} 
          logout={logout}
        />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/" /> : <Login login={login} />} 
            />
            <Route 
              path="/register" 
              element={isAuthenticated ? <Navigate to="/" /> : <Register login={login} />} 
            />
            <Route 
              path="/items/new" 
              element={isAuthenticated ? <ItemForm /> : <Navigate to="/login" />} 
            />
            <Route path="/items/:id" element={<ItemDetails />} />
            <Route 
              path="/profile" 
              element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

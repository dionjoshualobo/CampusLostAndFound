import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ItemForm from './pages/ItemForm';
import ItemDetails from './pages/ItemDetails';
import Profile from './pages/Profile';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

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
    return <div className="container mt-5">Loading...</div>;
  }
  
  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} user={user} logout={logout} />
      <div className="container mt-4">
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
    </Router>
  );
}

export default App;

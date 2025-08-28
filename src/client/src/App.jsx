import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import ItemForm from './pages/ItemForm';
import ItemDetails from './pages/ItemDetails';
import Profile from './pages/Profile';
import { supabase } from './config/supabase';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Check for existing Supabase session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          setIsLoading(false);
          return;
        }

        if (session) {
          const user = session.user;
          const userData = {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            userType: null,
            department: null,
            semester: null,
            contactInfo: null,
            profile_completed: false
          };

          setIsAuthenticated(true);
          setUser(userData);
          localStorage.setItem('token', session.access_token);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const user = session.user;
          const userData = {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            userType: null,
            department: null,
            semester: null,
            contactInfo: null,
            profile_completed: false
          };

          setIsAuthenticated(true);
          setUser(userData);
          localStorage.setItem('token', session.access_token);
          localStorage.setItem('user', JSON.stringify(userData));
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    );

    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      const isDark = JSON.parse(savedDarkMode);
      setIsDarkMode(isDark);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }

    return () => subscription.unsubscribe();
  }, []);
  
  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      const savedDarkMode = localStorage.getItem('darkMode');
      if (!savedDarkMode) {
        setIsDarkMode(e.matches);
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // Apply theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);
  
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };
  
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      // State cleanup happens in the onAuthStateChange listener
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback cleanup
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };
  
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };
  
  if (isLoading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading Campus Lost & Found...</p>
      </div>
    );
  }
  
  return (
    <Router>
      <div className="App">
        <Navbar 
          isAuthenticated={isAuthenticated} 
          user={user} 
          logout={logout}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/auth" 
              element={isAuthenticated ? <Navigate to="/" /> : <Auth />} 
            />
            <Route 
              path="/auth/callback" 
              element={<AuthCallback login={login} />} 
            />
            <Route 
              path="/login" 
              element={<Navigate to="/auth" replace />} 
            />
            <Route 
              path="/register" 
              element={<Navigate to="/auth" replace />} 
            />
            <Route 
              path="/items/new" 
              element={isAuthenticated ? <ItemForm /> : <Navigate to="/auth" />} 
            />
            <Route path="/items/:id" element={<ItemDetails />} />
            <Route 
              path="/profile" 
              element={isAuthenticated ? <Profile /> : <Navigate to="/auth" />} 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

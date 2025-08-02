const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const db = require('../config/db');
const auth = require('../middleware/supabase-auth');

// Register a user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, userType, department, semester, contactInfo } = req.body;
    
    if (!name || !email || !password || !userType || !department || !contactInfo) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    // Validate student semester requirement
    if (userType === 'student' && !semester) {
      return res.status(400).json({ message: 'Semester is required for students' });
    }
    
    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    if (!data.user) {
      return res.status(400).json({ message: 'Failed to create user' });
    }
    
    // Create user profile in our database with all fields
    try {
      await db.query(
        'INSERT INTO user_profiles (id, name, email, "userType", department, semester, "contactInfo") VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          data.user.id, 
          name, 
          email, 
          userType, 
          department, 
          userType === 'student' ? semester : null, 
          contactInfo
        ]
      );
    } catch (dbError) {
      console.error('Error creating user profile:', dbError);
      // If profile creation fails, we should clean up the auth user
      await supabase.auth.admin.deleteUser(data.user.id);
      return res.status(500).json({ message: 'Failed to create user profile' });
    }
    
    res.status(201).json({
      message: 'User created successfully. Please check your email for verification.',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: name,
        userType: userType,
        department: department,
        semester: userType === 'student' ? semester : null,
        contactInfo: contactInfo
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login a user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    
    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    if (!data.user || !data.session) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Ensure user profile exists in our database
    const profileResult = await db.query('SELECT * FROM user_profiles WHERE id = $1', [data.user.id]);
    
    if (profileResult.rows.length === 0) {
      // Create profile if it doesn't exist
      await db.query(
        'INSERT INTO user_profiles (id, name, email) VALUES ($1, $2, $3)',
        [data.user.id, data.user.user_metadata?.name || '', data.user.email]
      );
    }
    
    res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || ''
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user data
router.get('/user', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, userType, department, semester, contactInfo, createdAt FROM user_profiles WHERE id = $1', 
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout user
router.post('/logout', auth, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({ message: 'Refresh token required' });
    }
    
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

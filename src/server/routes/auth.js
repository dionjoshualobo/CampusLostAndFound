const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/db');
const auth = require('../middleware/auth');

// Register a user - disabled for OAuth
router.post('/register', async (req, res) => {
  res.status(400).json({ 
    message: 'Registration is handled via OAuth. Please use the Sign In with Google button.' 
  });
});

// Login a user - disabled for OAuth
router.post('/login', async (req, res) => {
  res.status(400).json({ 
    message: 'Login is handled via OAuth. Please use the Sign In with Google button.' 
  });
});

// Get user data
router.get('/user', auth, async (req, res) => {
  try {
    const { data: user, error: fetchError } = await supabase
      .from('profiles')
      .select('id, name, email, usertype, department, semester, contactinfo, profile_completed')
      .eq('id', req.user.id)
      .single();
    
    if (fetchError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.usertype,
      department: user.department,
      semester: user.semester,
      contactInfo: user.contactinfo,
      profile_completed: user.profile_completed
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check profile completion status
router.get('/profile-status', auth, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('profiles')
      .select('profile_completed')
      .eq('id', req.user.id)
      .single();
    
    if (error || !user) {
      return res.status(404).json({ 
        message: 'User not found',
        profile_completed: false 
      });
    }
    
    res.json({
      profile_completed: user.profile_completed || false
    });
  } catch (error) {
    console.error('Check profile status error:', error);
    res.status(500).json({ 
      message: 'Server error',
      profile_completed: false
    });
  }
});

module.exports = router;

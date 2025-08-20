const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/db');
const auth = require('../middleware/auth');

// Register a user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, userType, department, semester, contactInfo } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    
    // Check if user exists using Supabase
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Insert user into database with all profile fields using Supabase
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        name,
        email,
        passwordhash: passwordHash,
        usertype: userType || 'student',
        department: department || null,
        semester: semester || null,
        contactinfo: contactInfo || null
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);
      return res.status(500).json({ message: 'Error creating user', error: insertError.message });
    }
    
    const userId = newUser.id;
    
    // Create JWT token
    const token = jwt.sign(
      { user: { id: userId } },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: userId,
        name,
        email,
        userType: userType || 'student',
        department: department || null,
        semester: semester || null,
        contactInfo: contactInfo || null
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
    
    // Check if user exists using Supabase
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (fetchError || !user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Validate password
    const isMatch = await bcrypt.compare(password, user.passwordhash);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { user: { id: user.id } },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.usertype,
        department: user.department,
        semester: user.semester,
        contactInfo: user.contactinfo
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
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email, usertype, department, semester, contactinfo')
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
      contactInfo: user.contactinfo
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

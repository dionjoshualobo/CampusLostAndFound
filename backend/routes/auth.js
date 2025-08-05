const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const auth = require('../middleware/auth');

// Register a user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, userType, department, semester, contactInfo } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    
    // Check if user exists
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Insert user into database with all profile fields
    const insertResult = await db.query(
      'INSERT INTO users (name, email, passwordHash, usertype, department, semester, contactinfo) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [name, email, passwordHash, userType || 'student', department || null, semester || null, contactInfo || null]
    );
    
    const userId = insertResult.rows[0].id;
    
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
    
    // Check if user exists
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
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
    const result = await db.query('SELECT id, name, email, usertype, department, semester, contactinfo FROM users WHERE id = $1', [req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = result.rows[0];
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

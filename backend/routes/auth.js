const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const auth = require('../middleware/auth');

// Register a user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    
    // Check if user exists
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    
    if (rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Insert user into database
    const [result] = await db.execute(
      'INSERT INTO users (name, email, passwordHash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    );
    
    const userId = result.insertId;
    
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
        email
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
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const user = rows[0];
    
    // Validate password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    
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
        email: user.email
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
    const [rows] = await db.execute('SELECT id, name, email FROM users WHERE id = ?', [req.user.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

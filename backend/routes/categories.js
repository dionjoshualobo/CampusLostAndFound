const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM categories ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

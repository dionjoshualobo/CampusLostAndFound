const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, userType, department, semester, contactInfo, createdAt FROM users WHERE id = ?', 
      [req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Log to verify email is included in the response
    console.log('Fetched user profile, email included:', !!rows[0].email);
    
    // Get user's items
    const [items] = await db.execute(`
      SELECT i.*, c.name as categoryName
      FROM items i
      LEFT JOIN categories c ON i.categoryId = c.id
      WHERE i.userId = ?
      ORDER BY i.createdAt DESC
    `, [req.user.id]);
    
    res.json({
      user: rows[0],
      items
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile - more robust version
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, userType, department, semester, contactInfo } = req.body;
    
    // Debug logging
    console.log('Profile update received:', { name, userType, department, semester, contactInfo });
    
    // Check if user exists
    const [userExists] = await db.execute('SELECT id FROM users WHERE id = ?', [req.user.id]);
    
    if (userExists.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get existing user data to use as defaults
    const [existingUser] = await db.execute(
      'SELECT name, userType, department, semester, contactInfo FROM users WHERE id = ?',
      [req.user.id]
    );
    
    // Use existing values as defaults
    const updatedName = name || existingUser[0].name;
    let updatedUserType = userType;
    
    // Only allow 'student' or 'faculty' for userType
    if (updatedUserType !== 'student' && updatedUserType !== 'faculty') {
      updatedUserType = existingUser[0].userType || 'student';
    }
    
    // Clean and parse the semester value
    let parsedSemester = null;
    if (semester !== null && semester !== undefined && semester !== '') {
      if (typeof semester === 'number') {
        parsedSemester = semester;
      } else {
        try {
          parsedSemester = parseInt(semester, 10);
          if (isNaN(parsedSemester)) parsedSemester = null;
        } catch (err) {
          parsedSemester = null;
        }
      }
    }
    
    // Build the SQL dynamically based on available columns
    const updateFields = ['name = ?'];
    const updateValues = [updatedName];
    
    // Only include fields we've confirmed exist
    try {
      const [columns] = await db.execute('SHOW COLUMNS FROM users');
      const columnNames = columns.map(col => col.Field);
      
      if (columnNames.includes('userType')) {
        updateFields.push('userType = ?');
        updateValues.push(updatedUserType);
      }
      
      if (columnNames.includes('department')) {
        updateFields.push('department = ?');
        updateValues.push(department || null);
      }
      
      if (columnNames.includes('semester')) {
        updateFields.push('semester = ?');
        updateValues.push(parsedSemester);
      }
      
      if (columnNames.includes('contactInfo')) {
        updateFields.push('contactInfo = ?');
        updateValues.push(contactInfo || null);
      }
    } catch (err) {
      console.error('Error checking columns:', err);
      // Continue with basic fields only
    }
    
    // Add user ID for the WHERE clause
    updateValues.push(req.user.id);
    
    // Execute the update with available fields
    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    console.log('Executing SQL:', sql, updateValues);
    await db.execute(sql, updateValues);
    
    // Get updated user data
    const [rows] = await db.execute(
      'SELECT id, name, email FROM users WHERE id = ?', 
      [req.user.id]
    );
    
    // Try to get extended fields
    let userData = { ...rows[0] };
    try {
      const [extraData] = await db.execute(
        'SELECT userType, department, semester, contactInfo FROM users WHERE id = ?',
        [req.user.id]
      );
      
      if (extraData.length > 0) {
        userData = { ...userData, ...extraData[0] };
      }
    } catch (err) {
      console.log('Could not retrieve extended user data:', err.message);
    }
    
    res.json(userData);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Server error updating profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Change password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    
    // Get user with password
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [req.user.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Validate current password
    const isMatch = await bcrypt.compare(currentPassword, rows[0].passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await db.execute(
      'UPDATE users SET passwordHash = ? WHERE id = ?',
      [passwordHash, req.user.id]
    );
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user contact information - simplified and resilient to schema changes
router.get('/contact/:id', auth, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // First get only the core columns we know exist
    const [rows] = await db.execute(`
      SELECT id, name, email, contactInfo
      FROM users WHERE id = ?
    `, [userId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Try to get extended columns conditionally
    let userInfo = {
      id: rows[0].id,
      name: rows[0].name,
      email: rows[0].email,
      contactInfo: rows[0].contactInfo || 'Not provided'
    };
    
    // Try to get additional columns if they exist
    try {
      const [extendedRows] = await db.execute(`
        SHOW COLUMNS FROM users WHERE Field IN ('userType', 'department', 'semester')
      `);
      
      const existingColumns = extendedRows.map(row => row.Field);
      
      if (existingColumns.length > 0) {
        const columnsString = existingColumns.join(', ');
        const [extendedInfo] = await db.execute(`
          SELECT ${columnsString} FROM users WHERE id = ?
        `, [userId]);
        
        if (extendedInfo.length > 0) {
          userInfo = { ...userInfo, ...extendedInfo[0] };
        }
      }
    } catch (err) {
      console.log('Extended user info not available:', err.message);
      // Continue without extended info
    }
    
    res.json(userInfo);
  } catch (error) {
    console.error('Get user contact info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

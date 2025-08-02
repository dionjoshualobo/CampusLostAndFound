const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');

// Validation middleware for profile completion
const validateProfileCompletion = (userData) => {
  const errors = [];
  
  if (!userData.name || userData.name.trim() === '') {
    errors.push('Name is required');
  }
  
  if (!userData.userType || !['student', 'faculty'].includes(userData.userType)) {
    errors.push('Valid user type is required');
  }
  
  if (!userData.department || userData.department.trim() === '') {
    errors.push('Department is required');
  }
  
  if (!userData.contactInfo || userData.contactInfo.trim() === '') {
    errors.push('Contact information is required');
  } else {
    // Validate contact info format
    const phoneRegex = /^\d{10}$/;
    const emailRegex = /\S+@\S+\.\S+/;
    if (!phoneRegex.test(userData.contactInfo) && !emailRegex.test(userData.contactInfo)) {
      errors.push('Contact information must be a valid 10-digit phone number or email address');
    }
  }
  
  if (userData.userType === 'student' && (!userData.semester || userData.semester === '')) {
    errors.push('Semester is required for students');
  }
  
  return errors;
};

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, userType, department, semester, contactInfo, createdAt FROM users WHERE id = $1', 
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Log to verify email is included in the response
    console.log('Fetched user profile, email included:', !!result.rows[0].email);
    
    // Get user's items
    const itemsResult = await db.query(`
      SELECT i.*, c.name as categoryName
      FROM items i
      LEFT JOIN categories c ON i.categoryId = c.id
      WHERE i.userId = $1
      ORDER BY i.createdAt DESC
    `, [req.user.id]);
    
    res.json({
      user: result.rows[0],
      items: itemsResult.rows
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
    
    // Validate all required fields
    const validationErrors = validateProfileCompletion({
      name,
      userType,
      department,
      semester,
      contactInfo
    });
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: 'Profile validation failed',
        errors: validationErrors
      });
    }
    
    // Debug logging
    console.log('Profile update received:', { name, userType, department, semester, contactInfo });
    
    // Check if user exists
    const userResult = await db.query('SELECT id FROM users WHERE id = $1', [req.user.id]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Clean and parse the semester value
    let parsedSemester = null;
    if (userType === 'student') {
      if (semester !== null && semester !== undefined && semester !== '') {
        if (typeof semester === 'number') {
          parsedSemester = semester;
        } else {
          try {
            parsedSemester = parseInt(semester, 10);
            if (isNaN(parsedSemester)) {
              return res.status(400).json({ message: 'Invalid semester value' });
            }
          } catch (err) {
            return res.status(400).json({ message: 'Invalid semester value' });
          }
        }
      } else {
        return res.status(400).json({ message: 'Semester is required for students' });
      }
    }
    
    // Build the SQL dynamically based on available columns
    const updateFields = ['name = $1'];
    const updateValues = [name.trim()];
    
    // Only include fields we've confirmed exist
    try {
      const result = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users'
      `);
      const columnNames = result.rows.map(col => col.column_name);
      
      if (columnNames.includes('usertype')) {
        updateFields.push('userType = $' + (updateValues.length + 1));
        updateValues.push(userType);
      }
      
      if (columnNames.includes('department')) {
        updateFields.push('department = $' + (updateValues.length + 1));
        updateValues.push(department.trim());
      }
      
      if (columnNames.includes('semester')) {
        updateFields.push('semester = $' + (updateValues.length + 1));
        updateValues.push(parsedSemester);
      }
      
      if (columnNames.includes('contactinfo')) {
        updateFields.push('contactInfo = $' + (updateValues.length + 1));
        updateValues.push(contactInfo.trim());
      }
    } catch (err) {
      console.error('Error checking columns:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    
    // Add user ID for the WHERE clause
    updateValues.push(req.user.id);
    
    // Execute the update with available fields
    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${updateValues.length}`;
    console.log('Executing SQL:', sql, updateValues);
    await db.query(sql, updateValues);
    
    // Get updated user data
    const result = await db.query(
      'SELECT id, name, email FROM users WHERE id = $1', 
      [req.user.id]
    );
    
    // Try to get extended fields
    let userData = { ...result.rows[0] };
    try {
      const extraResult = await db.query(
        'SELECT userType, department, semester, contactInfo FROM users WHERE id = $1',
        [req.user.id]
      );
      
      if (extraResult.rows.length > 0) {
        userData = { ...userData, ...extraResult.rows[0] };
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
    const result = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Validate current password
    const isMatch = await bcrypt.compare(currentPassword, result.rows[0].passwordhash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await db.query(
      'UPDATE users SET passwordHash = $1 WHERE id = $2',
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
    const result = await db.query(`
      SELECT id, name, email, contactInfo
      FROM users WHERE id = $1
    `, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Try to get extended columns conditionally
    let userInfo = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      email: result.rows[0].email,
      contactinfo: result.rows[0].contactinfo || 'Not provided'
    };
    
    // Try to get additional columns if they exist
    try {
      const columnsResult = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name IN ('usertype', 'department', 'semester')
      `);
      
      const existingColumns = columnsResult.rows.map(row => row.column_name);
      
      if (existingColumns.length > 0) {
        const columnsString = existingColumns.join(', ');
        const extendedResult = await db.query(`
          SELECT ${columnsString} FROM users WHERE id = $1
        `, [userId]);
        
        if (extendedResult.rows.length > 0) {
          userInfo = { ...userInfo, ...extendedResult.rows[0] };
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

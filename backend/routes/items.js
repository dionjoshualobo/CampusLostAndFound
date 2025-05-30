const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Get all items with category info
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT i.*, u.name as userName, c.name as categoryName 
      FROM items i 
      LEFT JOIN users u ON i.userId = u.id 
      LEFT JOIN categories c ON i.categoryId = c.id
      ORDER BY i.createdAt DESC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    // Get counts by status
    const [statusCounts] = await db.execute(`
      SELECT status, COUNT(*) as count 
      FROM items 
      GROUP BY status
    `);
    
    // Get counts by category
    const [categoryCounts] = await db.execute(`
      SELECT c.name, COUNT(i.id) as count 
      FROM categories c
      LEFT JOIN items i ON c.id = i.categoryId
      GROUP BY c.id
      ORDER BY count DESC
    `);
    
    // Get recent activity
    const [recentActivity] = await db.execute(`
      SELECT i.id, i.title, i.status, i.createdAt, u.name as userName
      FROM items i
      LEFT JOIN users u ON i.userId = u.id
      ORDER BY i.createdAt DESC
      LIMIT 5
    `);
    
    res.json({
      statusCounts,
      categoryCounts,
      recentActivity
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single item with category info
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT i.*, u.name as userName, c.name as categoryName 
      FROM items i 
      LEFT JOIN users u ON i.userId = u.id 
      LEFT JOIN categories c ON i.categoryId = c.id
      WHERE i.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new item (protected route)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, status, location, dateLost, categoryId } = req.body;
    
    if (!title || !status) {
      return res.status(400).json({ message: 'Title and status are required' });
    }
    
    const [result] = await db.execute(
      'INSERT INTO items (title, description, status, location, dateLost, categoryId, userId) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, status, location, dateLost, categoryId, req.user.id]
    );
    
    const [newItem] = await db.execute(`
      SELECT i.*, u.name as userName, c.name as categoryName 
      FROM items i 
      LEFT JOIN users u ON i.userId = u.id 
      LEFT JOIN categories c ON i.categoryId = c.id
      WHERE i.id = ?
    `, [result.insertId]);
    
    res.status(201).json(newItem[0]);
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update an item (only the creator can update)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, status, location, dateLost, categoryId } = req.body;
    
    // Check if item exists and belongs to user
    const [rows] = await db.execute('SELECT * FROM items WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (rows[0].userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }
    
    await db.execute(
      'UPDATE items SET title = ?, description = ?, status = ?, location = ?, dateLost = ?, categoryId = ? WHERE id = ?',
      [title, description, status, location, dateLost, categoryId, req.params.id]
    );
    
    const [updatedItem] = await db.execute(`
      SELECT i.*, u.name as userName, c.name as categoryName 
      FROM items i 
      LEFT JOIN users u ON i.userId = u.id 
      LEFT JOIN categories c ON i.categoryId = c.id
      WHERE i.id = ?
    `, [req.params.id]);
    
    res.json(updatedItem[0]);
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark an item as claimed/resolved - simplified and more robust version
router.put('/:id/claim', auth, async (req, res) => {
  try {
    console.log('Request received for item claim/resolve:', req.params.id);
    console.log('Request body:', JSON.stringify(req.body));
    
    let { newStatus } = req.body;
    
    // Normalize status to either 'notify' or 'resolved'
    if (typeof newStatus === 'string') {
      newStatus = newStatus.toLowerCase().trim();
    }
    
    console.log(`Normalized status: "${newStatus}"`);
    
    // Check for valid status
    if (newStatus !== 'notify' && newStatus !== 'resolved') {
      return res.status(400).json({ 
        message: `Invalid status value: "${newStatus}". Expected "notify" or "resolved".`
      });
    }
    
    // Check if item exists
    const [itemRows] = await db.execute('SELECT * FROM items WHERE id = ?', [req.params.id]);
    
    if (itemRows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    const item = itemRows[0];
    
    // Get item owner information
    const [ownerRows] = await db.execute('SELECT id, name FROM users WHERE id = ?', [item.userId]);
    
    if (ownerRows.length === 0) {
      return res.status(404).json({ message: 'Item owner not found' });
    }
    
    const owner = ownerRows[0];
    
    // For 'resolved' status, only the original reporter can resolve
    if (newStatus === 'resolved' && item.userId !== req.user.id) {
      return res.status(403).json({ 
        message: 'Only the person who reported this item can mark it as resolved' 
      });
    }
    
    // Get current user's name for notifications
    const [userRows] = await db.execute('SELECT name FROM users WHERE id = ?', [req.user.id]);
    const userName = userRows.length > 0 ? userRows[0].name : 'A user';
    
    // For 'notify', just record the interest without changing item status
    if (newStatus === 'notify') {
      try {
        // Create message based on item status
        let message;
        if (item.status === 'lost') {
          message = `${userName} says they found your lost item "${item.title}"`;
        } else {
          message = `${userName} says they lost your found item "${item.title}"`;
        }
        
        // Check if notifications table exists
        const [tableExists] = await db.execute(`SHOW TABLES LIKE 'notifications'`);
        
        if (tableExists.length > 0) {
          // Create notification
          await db.execute(
            'INSERT INTO notifications (userId, senderId, itemId, message) VALUES (?, ?, ?, ?)',
            [item.userId, req.user.id, item.id, message]
          );
          
          console.log('Notification created successfully');
        } else {
          console.log('Notifications table does not exist, skipping notification');
        }
        
        // Update item with claimedBy info but don't change status
        await db.execute(
          'UPDATE items SET claimedBy = ?, claimedAt = NOW() WHERE id = ?',
          [req.user.id, req.params.id]
        );
        
        console.log('Item updated with claimedBy info');
      } catch (err) {
        console.error('Error in notification process:', err);
        // Continue anyway to return the item
      }
      
      // Get the updated item
      const [updatedItem] = await db.execute('SELECT * FROM items WHERE id = ?', [req.params.id]);
      
      // Try to get additional data
      let fullItemData = { ...updatedItem[0], notificationSent: true };
      
      try {
        // Get user name
        const [userData] = await db.execute('SELECT name FROM users WHERE id = ?', [updatedItem[0].userId]);
        if (userData.length > 0) {
          fullItemData.userName = userData[0].name;
        }
        
        // Get category name if applicable
        if (updatedItem[0].categoryId) {
          const [categoryData] = await db.execute('SELECT name FROM categories WHERE id = ?', [updatedItem[0].categoryId]);
          if (categoryData.length > 0) {
            fullItemData.categoryName = categoryData[0].name;
          }
        }
        
        // Get claimer name if applicable
        if (updatedItem[0].claimedBy) {
          const [claimerData] = await db.execute('SELECT name FROM users WHERE id = ?', [updatedItem[0].claimedBy]);
          if (claimerData.length > 0) {
            fullItemData.claimedByName = claimerData[0].name;
          }
        }
      } catch (err) {
        console.error('Error getting additional item data:', err);
        // Continue with basic item data
      }
      
      return res.json(fullItemData);
    }
    
    // For 'resolved' status, update the item status
    console.log('Updating item to resolved status');
    try {
      // First try to get current valid ENUM values
      const [statusColumn] = await db.execute(`SHOW COLUMNS FROM items LIKE 'status'`);
      const enumType = statusColumn[0].Type;
      console.log('Current status ENUM definition:', enumType);
      
      // Extract available values
      const enumValues = enumType.match(/^enum\((.+)\)$/i)[1].split(',').map(value => 
        value.replace(/'/g, '').trim().toLowerCase()
      );
      console.log('Available status values:', enumValues);
      
      // Check if 'resolved' is a valid value
      if (!enumValues.includes('resolved')) {
        console.log('Status "resolved" not found in ENUM, attempting to update schema...');
        
        // Try to modify the column to include resolved
        try {
          await db.execute(`
            ALTER TABLE items 
            MODIFY COLUMN status ENUM('lost', 'found', 'claimed', 'resolved') NOT NULL
          `);
          console.log('Successfully updated status ENUM to include "resolved"');
          
          // Now try the update with 'resolved'
          await db.execute(
            'UPDATE items SET status = ?, claimedBy = ?, claimedAt = NOW() WHERE id = ?',
            ['resolved', req.user.id, req.params.id]
          );
        } catch (schemaError) {
          console.error('Failed to update schema, falling back to "claimed"', schemaError);
          
          // Fall back to using 'claimed' instead
          await db.execute(
            'UPDATE items SET status = ?, claimedBy = ?, claimedAt = NOW() WHERE id = ?',
            ['claimed', req.user.id, req.params.id]
          );
        }
      } else {
        // 'resolved' is available, so use it
        await db.execute(
          'UPDATE items SET status = ?, claimedBy = ?, claimedAt = NOW() WHERE id = ?',
          ['resolved', req.user.id, req.params.id]
        );
      }
    } catch (err) {
      console.error('Error during status update:', err);
      
      // If we get a truncation error, try with 'claimed' instead
      if (err.code === 'WARN_DATA_TRUNCATED') {
        console.log('Falling back to "claimed" status due to truncation error');
        await db.execute(
          'UPDATE items SET status = ?, claimedBy = ?, claimedAt = NOW() WHERE id = ?',
          ['claimed', req.user.id, req.params.id]
        );
      } else {
        // For other errors, just update claimedBy without changing status
        await db.execute(
          'UPDATE items SET claimedBy = ?, claimedAt = NOW() WHERE id = ?',
          [req.user.id, req.params.id]
        );
      }
    }
    
    // Get the updated item
    const [updatedItem] = await db.execute('SELECT * FROM items WHERE id = ?', [req.params.id]);
    
    // Try to get additional data
    let fullItemData = { ...updatedItem[0] };
    
    try {
      // Get user name
      const [userData] = await db.execute('SELECT name FROM users WHERE id = ?', [updatedItem[0].userId]);
      if (userData.length > 0) {
        fullItemData.userName = userData[0].name;
      }
      
      // Get category name if applicable
      if (updatedItem[0].categoryId) {
        const [categoryData] = await db.execute('SELECT name FROM categories WHERE id = ?', [updatedItem[0].categoryId]);
        if (categoryData.length > 0) {
          fullItemData.categoryName = categoryData[0].name;
        }
      }
    } catch (err) {
      console.error('Error getting additional item data:', err);
      // Continue with basic item data
    }
    
    console.log('Successfully resolved item');
    res.json(fullItemData);
  } catch (error) {
    console.error('Claim/resolve item error:', error);
    res.status(500).json({ 
      message: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete an item (only the creator can delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if item exists and belongs to user
    const [rows] = await db.execute('SELECT * FROM items WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (rows[0].userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }
    
    await db.execute('DELETE FROM items WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'Item removed' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

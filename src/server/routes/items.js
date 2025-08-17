const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const { validateItemReport } = require('../middleware/validation');
const { upload, uploadToSupabase, deleteFromSupabase } = require('../middleware/upload');

// Get all items with category info and images
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        i.id,
        i.title,
        i.description,
        i.status,
        i.location,
        i.datelost as "dateLost",
        i.categoryid as "categoryId",
        i.userid as "userId",
        i.claimedby as "claimedBy",
        i.claimedat as "claimedAt",
        i.createdat as "createdAt",
        u.name as "userName", 
        c.name as "categoryName",
        claimer.name as "claimedByName",
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', img.id,
              'url', img.imageurl,
              'filename', img.filename
            )
          ) FILTER (WHERE img.id IS NOT NULL),
          '[]'
        ) as images
      FROM items i 
      LEFT JOIN users u ON i.userid = u.id 
      LEFT JOIN categories c ON i.categoryid = c.id
      LEFT JOIN users claimer ON i.claimedby = claimer.id
      LEFT JOIN item_images img ON i.id = img.itemid
      GROUP BY i.id, u.name, c.name, claimer.name
      ORDER BY i.createdat DESC
    `);
    
    console.log('Returning items:', result.rows.length);
    console.log('Sample item images:', result.rows[0]?.images);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    // Get counts by status
    const result = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM items 
      GROUP BY status
    `);
    
    res.json({
      statusCounts: result.rows
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single item with category info and images
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        i.id,
        i.title,
        i.description,
        i.status,
        i.location,
        i.datelost as "dateLost",
        i.categoryid as "categoryId",
        i.userid as "userId",
        i.claimedby as "claimedBy",
        i.claimedat as "claimedAt",
        i.createdat as "createdAt",
        u.name as "userName", 
        c.name as "categoryName",
        claimer.name as "claimedByName",
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', img.id,
              'url', img.imageurl,
              'filename', img.filename
            )
          ) FILTER (WHERE img.id IS NOT NULL),
          '[]'
        ) as images
      FROM items i 
      LEFT JOIN users u ON i.userid = u.id 
      LEFT JOIN categories c ON i.categoryid = c.id
      LEFT JOIN users claimer ON i.claimedby = claimer.id
      LEFT JOIN item_images img ON i.id = img.itemid
      WHERE i.id = $1
      GROUP BY i.id, u.name, c.name, claimer.name
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new item (protected route) with validation and optional image upload
router.post('/', auth, upload.single('image'), validateItemReport, async (req, res) => {
  let uploadedImageData = null;
  
  try {
    const { title, description, status, location, dateLost, categoryId } = req.body;
    
    console.log('Received item data:', { title, description, status, location, dateLost, categoryId });
    console.log('Received file:', req.file ? 'Yes' : 'No');
    
    // Upload image to Supabase if provided
    if (req.file) {
      try {
        uploadedImageData = await uploadToSupabase(req.file);
        console.log('Image uploaded successfully:', uploadedImageData.url);
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        // Don't return error - allow item creation to continue without image
        // The user can always add images later if needed
      }
    }
    
    // Create item
    const result = await db.query(
      'INSERT INTO items (title, description, status, location, datelost, categoryid, userid) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [title, description || null, status, location, dateLost, categoryId, req.user.id]
    );
    
    const itemId = result.rows[0].id;
    
    // Save image data if uploaded
    if (uploadedImageData) {
      await db.query(
        'INSERT INTO item_images (itemid, imageurl, filename, filesize, mimetype) VALUES ($1, $2, $3, $4, $5)',
        [itemId, uploadedImageData.url, uploadedImageData.filename, uploadedImageData.size, uploadedImageData.mimetype]
      );
    }
    
    // Get the complete item data with images
    const newItemResult = await db.query(`
      SELECT 
        i.id,
        i.title,
        i.description,
        i.status,
        i.location,
        i.datelost as "dateLost",
        i.categoryid as "categoryId",
        i.userid as "userId",
        i.claimedby as "claimedBy",
        i.claimedat as "claimedAt",
        i.createdat as "createdAt",
        u.name as "userName", 
        c.name as "categoryName",
        claimer.name as "claimedByName",
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', img.id,
              'url', img.imageurl,
              'filename', img.filename
            )
          ) FILTER (WHERE img.id IS NOT NULL),
          '[]'
        ) as images
      FROM items i 
      LEFT JOIN users u ON i.userid = u.id 
      LEFT JOIN categories c ON i.categoryid = c.id
      LEFT JOIN users claimer ON i.claimedby = claimer.id
      LEFT JOIN item_images img ON i.id = img.itemid
      WHERE i.id = $1
      GROUP BY i.id, u.name, c.name, claimer.name
    `, [itemId]);
    
    res.status(201).json(newItemResult.rows[0]);
  } catch (error) {
    console.error('Create item error:', error);
    
    // Clean up uploaded image if item creation failed
    if (uploadedImageData) {
      try {
        await deleteFromSupabase(uploadedImageData.path);
      } catch (deleteError) {
        console.error('Failed to clean up uploaded image:', deleteError);
      }
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Update an item (only the creator can update)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, status, location, dateLost, categoryId } = req.body;
    
    // Check if item exists and belongs to user
    const result = await db.query('SELECT * FROM items WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (result.rows[0].userid !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }
    
    await db.query(
      'UPDATE items SET title = $1, description = $2, status = $3, location = $4, datelost = $5, categoryid = $6 WHERE id = $7',
      [title, description, status, location, dateLost, categoryId, req.params.id]
    );
    
    const updatedResult = await db.query(`
      SELECT 
        i.id,
        i.title,
        i.description,
        i.status,
        i.location,
        i.datelost as "dateLost",
        i.categoryid as "categoryId",
        i.userid as "userId",
        i.claimedby as "claimedBy",
        i.claimedat as "claimedAt",
        i.createdat as "createdAt",
        u.name as "userName", 
        c.name as "categoryName",
        claimer.name as "claimedByName"
      FROM items i 
      LEFT JOIN users u ON i.userid = u.id 
      LEFT JOIN categories c ON i.categoryid = c.id
      LEFT JOIN users claimer ON i.claimedby = claimer.id
      WHERE i.id = $1
    `, [req.params.id]);
    
    res.json(updatedResult.rows[0]);
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
    const itemResult = await db.query('SELECT * FROM items WHERE id = $1', [req.params.id]);
    
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    const item = itemResult.rows[0];
    
    // Get item owner information
    const ownerResult = await db.query('SELECT id, name FROM users WHERE id = $1', [item.userid]);
    
    if (ownerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Item owner not found' });
    }
    
    const owner = ownerResult.rows[0];
    
    // For 'resolved' status, only the original reporter can resolve
    if (newStatus === 'resolved' && item.userid !== req.user.id) {
      return res.status(403).json({ 
        message: 'Only the person who reported this item can mark it as resolved' 
      });
    }
    
    // Get current user's name for notifications
    const userResult = await db.query('SELECT name FROM users WHERE id = $1', [req.user.id]);
    const userName = userResult.rows.length > 0 ? userResult.rows[0].name : 'A user';
    
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
        const tableExists = await db.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'notifications'
          );
        `);
        
        if (tableExists.rows[0].exists) {
        // Create notification
          await db.query(
            'INSERT INTO notifications (userid, senderid, itemid, message) VALUES ($1, $2, $3, $4)',
            [item.userid, req.user.id, item.id, message]
          );
          
          console.log('Notification created successfully');
        } else {
          console.log('Notifications table does not exist, skipping notification');
        }
        
        // Update item with claimedBy info but don't change status
        await db.query(
          'UPDATE items SET claimedby = $1, claimedat = NOW() WHERE id = $2',
          [req.user.id, req.params.id]
        );
        
        console.log('Item updated with claimedBy info');
      } catch (err) {
        console.error('Error in notification process:', err);
        // Continue anyway to return the item
      }
      
      // Get the updated item
      const updatedResult = await db.query('SELECT * FROM items WHERE id = $1', [req.params.id]);
      
      // Try to get additional data
      let fullItemData = { ...updatedResult.rows[0], notificationSent: true };
      
      try {
        // Get user name
        const userData = await db.query('SELECT name FROM users WHERE id = $1', [updatedResult.rows[0].userid]);
        if (userData.rows.length > 0) {
          fullItemData.userName = userData.rows[0].name;
        }
        
        // Get category name if applicable
        if (updatedResult.rows[0].categoryid) {
          const categoryData = await db.query('SELECT name FROM categories WHERE id = $1', [updatedResult.rows[0].categoryid]);
          if (categoryData.rows.length > 0) {
            fullItemData.categoryName = categoryData.rows[0].name;
          }
        }
        
        // Get claimer name if applicable
        if (updatedResult.rows[0].claimedby) {
          const claimerData = await db.query('SELECT name FROM users WHERE id = $1', [updatedResult.rows[0].claimedby]);
          if (claimerData.rows.length > 0) {
            fullItemData.claimedByName = claimerData.rows[0].name;
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
      // PostgreSQL supports the resolved status natively since we defined it in the schema
      await db.query(
        'UPDATE items SET status = $1, claimedBy = $2, claimedAt = NOW() WHERE id = $3',
        ['resolved', req.user.id, req.params.id]
      );
    } catch (err) {
      console.error('Error during status update:', err);
      
      // Fall back to using 'claimed' instead
      await db.query(
        'UPDATE items SET status = $1, claimedBy = $2, claimedAt = NOW() WHERE id = $3',
        ['claimed', req.user.id, req.params.id]
      );
    }
    
    // Get the updated item
    const updatedResult = await db.query('SELECT * FROM items WHERE id = $1', [req.params.id]);
    
    // Try to get additional data
    let fullItemData = { ...updatedResult.rows[0] };
    
    try {
      // Get user name
      const userData = await db.query('SELECT name FROM users WHERE id = $1', [updatedResult.rows[0].userid]);
      if (userData.rows.length > 0) {
        fullItemData.userName = userData.rows[0].name;
      }
      
      // Get category name if applicable
      if (updatedResult.rows[0].categoryid) {
        const categoryData = await db.query('SELECT name FROM categories WHERE id = $1', [updatedResult.rows[0].categoryid]);
        if (categoryData.rows.length > 0) {
          fullItemData.categoryName = categoryData.rows[0].name;
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
    const result = await db.query('SELECT * FROM items WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (result.rows[0].userid !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }
    
    await db.query('DELETE FROM items WHERE id = $1', [req.params.id]);
    
    res.json({ message: 'Item removed' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an image from an item (only the creator can delete)
router.delete('/:id/images/:imageId', auth, async (req, res) => {
  try {
    const { id: itemId, imageId } = req.params;
    
    // Check if item exists and belongs to user
    const itemResult = await db.query('SELECT userid FROM items WHERE id = $1', [itemId]);
    
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (itemResult.rows[0].userid !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this image' });
    }
    
    // Get image data
    const imageResult = await db.query('SELECT * FROM item_images WHERE id = $1 AND itemid = $2', [imageId, itemId]);
    
    if (imageResult.rows.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    const imageData = imageResult.rows[0];
    
    // Delete from database first
    await db.query('DELETE FROM item_images WHERE id = $1', [imageId]);
    
    // Try to delete from Supabase storage
    try {
      const filePath = `item-images/${imageData.filename}`;
      await deleteFromSupabase(filePath);
    } catch (deleteError) {
      console.error('Failed to delete image from storage:', deleteError);
      // Don't fail the request if storage deletion fails
    }
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

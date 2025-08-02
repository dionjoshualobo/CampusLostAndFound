const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Get comments for an item
router.get('/item/:itemId', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, u.name as userName 
      FROM comments c
      JOIN users u ON c.userId = u.id
      WHERE c.itemId = $1
      ORDER BY c.createdAt DESC
    `, [req.params.itemId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a comment to an item (protected route)
router.post('/', auth, async (req, res) => {
  try {
    const { itemId, content } = req.body;
    
    if (!itemId || !content) {
      return res.status(400).json({ message: 'ItemId and content are required' });
    }
    
    // Check if item exists
    const itemResult = await db.query('SELECT * FROM items WHERE id = $1', [itemId]);
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Insert comment
    const insertResult = await db.query(
      'INSERT INTO comments (itemId, userId, content) VALUES ($1, $2, $3) RETURNING id',
      [itemId, req.user.id, content]
    );
    
    // Get the new comment with user info
    const commentResult = await db.query(`
      SELECT c.*, u.name as userName 
      FROM comments c
      JOIN users u ON c.userId = u.id
      WHERE c.id = $1
    `, [insertResult.rows[0].id]);
    
    res.status(201).json(commentResult.rows[0]);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a comment (only owner or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if comment exists and belongs to user
    const result = await db.query('SELECT * FROM comments WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    if (result.rows[0].userid !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    await db.query('DELETE FROM comments WHERE id = $1', [req.params.id]);
    
    res.json({ message: 'Comment removed' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Get all notifications for the current user
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        n.id,
        n.userid as "userId",
        n.senderid as "senderId", 
        n.itemid as "itemId",
        n.message,
        n.isread as "isRead",
        n.createdat as "createdAt",
        u.name as "senderName", 
        i.title as "itemTitle"
      FROM notifications n
      JOIN users u ON n.senderid = u.id
      JOIN items i ON n.itemid = i.id
      WHERE n.userid = $1
      ORDER BY n.createdat DESC
    `, [req.user.id]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    // Verify the notification belongs to the user
    const result = await db.query('SELECT * FROM notifications WHERE id = $1 AND userid = $2', 
      [req.params.id, req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    await db.query('UPDATE notifications SET isread = true WHERE id = $1', [req.params.id]);
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    // Verify the notification belongs to the user
    const result = await db.query('SELECT * FROM notifications WHERE id = $1 AND userid = $2', 
      [req.params.id, req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    await db.query('DELETE FROM notifications WHERE id = $1', [req.params.id]);
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a notification (internal function, not exposed as API)
// This will be called from the items route when claiming

module.exports = router;

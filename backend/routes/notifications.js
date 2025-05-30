const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Get all notifications for the current user
router.get('/', auth, async (req, res) => {
  try {
    const [notifications] = await db.execute(`
      SELECT n.*, u.name as senderName, i.title as itemTitle, i.id as itemId 
      FROM notifications n
      JOIN users u ON n.senderId = u.id
      JOIN items i ON n.itemId = i.id
      WHERE n.userId = ?
      ORDER BY n.createdAt DESC
    `, [req.user.id]);
    
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    // Verify the notification belongs to the user
    const [rows] = await db.execute('SELECT * FROM notifications WHERE id = ? AND userId = ?', 
      [req.params.id, req.user.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    await db.execute('UPDATE notifications SET isRead = true WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a notification (internal function, not exposed as API)
// This will be called from the items route when claiming

module.exports = router;

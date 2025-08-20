const express = require('express');
const router = express.Router();
const supabase = require('../config/db');
const auth = require('../middleware/auth');

// Get all notifications for the current user
router.get('/', auth, async (req, res) => {
  try {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select(`
        id,
        userid,
        senderid,
        itemid,
        message,
        isread,
        createdat,
        users:senderid (
          name
        ),
        items:itemid (
          title
        )
      `)
      .eq('userid', req.user.id)
      .order('createdat', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }

    // Transform the data to match expected format
    const transformedNotifications = notifications.map(notification => ({
      id: notification.id,
      userId: notification.userid,
      senderId: notification.senderid,
      itemId: notification.itemid,
      message: notification.message,
      isRead: notification.isread,
      createdAt: notification.createdat,
      senderName: notification.users?.name || 'Unknown User',
      itemTitle: notification.items?.title || 'Unknown Item'
    }));
    
    res.json(transformedNotifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    // Verify the notification belongs to the user using Supabase
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', req.params.id)
      .eq('userid', req.user.id)
      .single();
    
    if (fetchError || !notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    const { error: updateError } = await supabase
      .from('notifications')
      .update({ isread: true })
      .eq('id', req.params.id);

    if (updateError) {
      console.error('Error marking notification as read:', updateError);
      return res.status(500).json({ message: 'Error updating notification', error: updateError.message });
    }
    
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

const express = require('express');
const router = express.Router();
const supabase = require('../config/db');
const auth = require('../middleware/auth');

// Get comments for an item
router.get('/item/:itemId', async (req, res) => {
  try {
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        id,
        itemid,
        userid,
        content,
        createdat,
        users:userid (
          name
        )
      `)
      .eq('itemid', req.params.itemId)
      .order('createdat', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return res.status(500).json({ message: 'Error fetching comments', error: error.message });
    }

    // Transform the data to match expected format
    const transformedComments = comments.map(comment => ({
      id: comment.id,
      itemId: comment.itemid,
      userId: comment.userid,
      content: comment.content,
      createdAt: comment.createdat,
      userName: comment.users?.name || 'Unknown User'
    }));
    
    res.json(transformedComments);
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
    
    // Check if item exists using Supabase
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Insert comment using Supabase
    const { data: newComment, error: insertError } = await supabase
      .from('comments')
      .insert({
        itemid: itemId,
        userid: req.user.id,
        content: content
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creating comment:', insertError);
      return res.status(500).json({ message: 'Error creating comment', error: insertError.message });
    }
    
    // Get the new comment with user info using Supabase
    const { data: commentWithUser, error: fetchError } = await supabase
      .from('comments')
      .select(`
        id,
        itemid,
        userid,
        content,
        createdat,
        users:userid (
          name
        )
      `)
      .eq('id', newComment.id)
      .single();

    if (fetchError) {
      console.error('Error fetching created comment:', fetchError);
      return res.status(201).json({ id: newComment.id, message: 'Comment created successfully' });
    }

    // Transform the data to match expected format
    const transformedComment = {
      id: commentWithUser.id,
      itemId: commentWithUser.itemid,
      userId: commentWithUser.userid,
      content: commentWithUser.content,
      createdAt: commentWithUser.createdat,
      userName: commentWithUser.users?.name || 'Unknown User'
    };
    
    res.status(201).json(transformedComment);
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

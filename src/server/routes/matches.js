const express = require('express');
const router = express.Router();
const supabase = require('../config/db');
const auth = require('../middleware/auth');
const { getMatchesForUser } = require('../services/matching');

// Get all matches for the current user
router.get('/', auth, async (req, res) => {
  try {
    const matches = await getMatchesForUser(req.user.id);
    res.json(matches);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific match by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { data: match, error } = await supabase
      .from('item_matches')
      .select(`
        id,
        match_score,
        match_details,
        status,
        createdat,
        lost_item_id,
        found_item_id,
        lost_item:items!lost_item_id (
          id,
          title,
          description,
          status,
          location,
          datelost,
          userid,
          images:item_images (url)
        ),
        found_item:items!found_item_id (
          id,
          title,
          description,
          status,
          location,
          datelost,
          userid,
          images:item_images (url)
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Verify user owns one of the items
    const userId = req.user.id;
    const ownsLostItem = match.lost_item?.userid === userId;
    const ownsFoundItem = match.found_item?.userid === userId;

    if (!ownsLostItem && !ownsFoundItem) {
      return res.status(403).json({ message: 'Not authorized to view this match' });
    }

    // Mark as viewed if currently pending
    if (match.status === 'pending') {
      await supabase
        .from('item_matches')
        .update({ status: 'viewed' })
        .eq('id', req.params.id);
    }

    res.json(match);
  } catch (error) {
    console.error('Get match error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dismiss a match
router.post('/:id/dismiss', auth, async (req, res) => {
  try {
    // Verify match exists and user owns one of the items
    const { data: match, error: fetchError } = await supabase
      .from('item_matches')
      .select(`
        id,
        lost_item_id,
        found_item_id,
        lost_item:items!lost_item_id (userid),
        found_item:items!found_item_id (userid)
      `)
      .eq('id', req.params.id)
      .single();

    if (fetchError || !match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const userId = req.user.id;
    const ownsLostItem = match.lost_item?.userid === userId;
    const ownsFoundItem = match.found_item?.userid === userId;

    if (!ownsLostItem && !ownsFoundItem) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { error: updateError } = await supabase
      .from('item_matches')
      .update({ status: 'dismissed' })
      .eq('id', req.params.id);

    if (updateError) {
      console.error('Error dismissing match:', updateError);
      return res.status(500).json({ message: 'Error dismissing match' });
    }

    res.json({ message: 'Match dismissed' });
  } catch (error) {
    console.error('Dismiss match error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Contact - express interest in a match (reveals contact info)
router.post('/:id/contact', auth, async (req, res) => {
  try {
    // Verify match exists and user owns one of the items
    const { data: match, error: fetchError } = await supabase
      .from('item_matches')
      .select(`
        id,
        lost_item_id,
        found_item_id,
        match_score,
        lost_item:items!lost_item_id (id, title, userid),
        found_item:items!found_item_id (id, title, userid)
      `)
      .eq('id', req.params.id)
      .single();

    if (fetchError || !match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const userId = req.user.id;
    const lostItem = match.lost_item;
    const foundItem = match.found_item;

    const ownsLostItem = lostItem?.userid === userId;
    const ownsFoundItem = foundItem?.userid === userId;

    if (!ownsLostItem && !ownsFoundItem) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Determine the other user
    const otherUserId = ownsLostItem ? foundItem?.userid : lostItem?.userid;

    // Get contact info for the other user
    const { data: otherUser, error: userError } = await supabase
      .from('profiles')
      .select('name, email, phone')
      .eq('id', otherUserId)
      .single();

    if (userError || !otherUser) {
      return res.status(404).json({ message: 'Could not find user contact info' });
    }

    // Update match status
    await supabase
      .from('item_matches')
      .update({ status: 'contacted' })
      .eq('id', req.params.id);

    // Create notification for the other user
    await supabase
      .from('notifications')
      .insert({
        userid: otherUserId,
        senderid: userId,
        itemid: ownsLostItem ? lostItem.id : foundItem.id,
        message: `Someone is interested in your match! (${match.match_score}% match - "${ownsLostItem ? lostItem.title : foundItem.title}")`
      });

    res.json({
      message: 'Contact info retrieved',
      contact: {
        name: otherUser.name,
        email: otherUser.email,
        phone: otherUser.phone
      }
    });
  } catch (error) {
    console.error('Contact match error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

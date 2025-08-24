const express = require('express');
const router = express.Router();
const supabase = require('../config/db');
const auth = require('../middleware/auth');
const { validateItemReport } = require('../middleware/validation');
const { upload, uploadToSupabase, deleteFromSupabase } = require('../middleware/upload');

// Get all items with category info and images
router.get('/', async (req, res) => {
  try {
    // Using Supabase query builder
    const { data: items, error } = await supabase
      .from('items')
      .select(`
        id,
        title,
        description,
        status,
        location,
        datelost,
        categoryid,
        userid,
        claimedby,
        claimedat,
        createdat,
        users:userid (
          name
        ),
        categories:categoryid (
          name
        ),
        claimer:claimedby (
          name
        ),
        item_images (
          id,
          imageurl,
          filename
        )
      `)
      .order('createdat', { ascending: false });

    if (error) {
      console.error('Error fetching items:', error);
      return res.status(500).json({ message: 'Error fetching items', error: error.message });
    }

    // Transform the data to match the expected format
    const transformedItems = items.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      status: item.status,
      location: item.location,
      dateLost: item.datelost,
      categoryId: item.categoryid,
      userId: item.userid,
      claimedBy: item.claimedby,
      claimedAt: item.claimedat,
      createdAt: item.createdat,
      userName: item.users?.name || null,
      categoryName: item.categories?.name || null,
      claimedByName: item.claimer?.name || null,
      images: (item.item_images || []).map(img => ({
        id: img.id,
        url: img.imageurl,
        filename: img.filename
      }))
    }));
    
    res.json(transformedItems);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    // Get counts by status using Supabase
    const { data: statusCounts, error } = await supabase
      .from('items')
      .select('status')
      .then(({ data, error }) => {
        if (error) return { data: null, error };
        
        // Group by status and count
        const counts = data.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {});
        
        // Convert to array format
        const statusCounts = Object.entries(counts).map(([status, count]) => ({
          status,
          count: count.toString()
        }));
        
        return { data: statusCounts, error: null };
      });

    if (error) {
      console.error('Error fetching stats:', error);
      return res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
    
    res.json({
      statusCounts: statusCounts || []
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single item with category info and images
router.get('/:id', async (req, res) => {
  try {
    const { data: item, error } = await supabase
      .from('items')
      .select(`
        id,
        title,
        description,
        status,
        location,
        datelost,
        categoryid,
        userid,
        claimedby,
        claimedat,
        createdat,
        users:userid (
          name
        ),
        categories:categoryid (
          name
        ),
        claimer:claimedby (
          name
        ),
        item_images (
          id,
          imageurl,
          filename
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Item not found' });
      }
      console.error('Error fetching item:', error);
      return res.status(500).json({ message: 'Error fetching item', error: error.message });
    }

    // Transform the data to match the expected format
    const transformedItem = {
      id: item.id,
      title: item.title,
      description: item.description,
      status: item.status,
      location: item.location,
      dateLost: item.datelost,
      categoryId: item.categoryid,
      userId: item.userid,
      claimedBy: item.claimedby,
      claimedAt: item.claimedat,
      createdAt: item.createdat,
      userName: item.users?.name || null,
      categoryName: item.categories?.name || null,
      claimedByName: item.claimer?.name || null,
      images: (item.item_images || []).map(img => ({
        id: img.id,
        url: img.imageurl,
        filename: img.filename
      }))
    };
    
    res.json(transformedItem);
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
    
    // Create item using Supabase
    const { data: newItem, error: itemError } = await supabase
      .from('items')
      .insert({
        title,
        description: description || null,
        status,
        location,
        datelost: dateLost,
        categoryid: categoryId,
        userid: req.user.id
      })
      .select('id')
      .single();

    if (itemError) {
      console.error('Error creating item:', itemError);
      return res.status(500).json({ message: 'Error creating item', error: itemError.message });
    }

    const itemId = newItem.id;
    
    // Save image data if uploaded
    if (uploadedImageData) {
      const { error: imageError } = await supabase
        .from('item_images')
        .insert({
          itemid: itemId,
          imageurl: uploadedImageData.url,
          filename: uploadedImageData.filename,
          filesize: uploadedImageData.size,
          mimetype: uploadedImageData.mimetype
        });

      if (imageError) {
        console.error('Error saving image data:', imageError);
        // Item was created, but image metadata failed to save
        // We could optionally delete the uploaded image from storage here
      }
    }
    
    // Get the complete item data with images using Supabase
    const { data: newItemData, error: fetchError } = await supabase
      .from('items')
      .select(`
        id,
        title,
        description,
        status,
        location,
        datelost,
        categoryid,
        userid,
        claimedby,
        claimedat,
        createdat,
        users:userid (
          name
        ),
        categories:categoryid (
          name
        ),
        claimer:claimedby (
          name
        ),
        item_images (
          id,
          imageurl,
          filename
        )
      `)
      .eq('id', itemId)
      .single();

    if (fetchError) {
      console.error('Error fetching created item:', fetchError);
      return res.status(201).json({ id: itemId, message: 'Item created successfully' });
    }

    // Transform the data to match the expected format
    const transformedItem = {
      id: newItemData.id,
      title: newItemData.title,
      description: newItemData.description,
      status: newItemData.status,
      location: newItemData.location,
      dateLost: newItemData.datelost,
      categoryId: newItemData.categoryid,
      userId: newItemData.userid,
      claimedBy: newItemData.claimedby,
      claimedAt: newItemData.claimedat,
      createdAt: newItemData.createdat,
      userName: newItemData.users?.name || null,
      categoryName: newItemData.categories?.name || null,
      claimedByName: newItemData.claimer?.name || null,
      images: (newItemData.item_images || []).map(img => ({
        id: img.id,
        url: img.imageurl,
        filename: img.filename
      }))
    };
    
    res.status(201).json(transformedItem);
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
    
    // Check if item exists and belongs to user using Supabase
    const { data: existingItem, error: fetchError } = await supabase
      .from('items')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Item not found' });
      }
      console.error('Error fetching item:', fetchError);
      return res.status(500).json({ message: 'Error fetching item' });
    }
    
    if (existingItem.userid !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }
    
    // Update the item using Supabase
    const { error: updateError } = await supabase
      .from('items')
      .update({
        title,
        description,
        status,
        location,
        datelost: dateLost,
        categoryid: categoryId
      })
      .eq('id', req.params.id);

    if (updateError) {
      console.error('Error updating item:', updateError);
      return res.status(500).json({ message: 'Error updating item', error: updateError.message });
    }
    
    // Get the updated item data with related info
    const { data: updatedItem, error: updatedFetchError } = await supabase
      .from('items')
      .select(`
        id,
        title,
        description,
        status,
        location,
        datelost,
        categoryid,
        userid,
        claimedby,
        claimedat,
        createdat,
        users:userid (
          name
        ),
        categories:categoryid (
          name
        ),
        claimer:claimedby (
          name
        ),
        item_images (
          id,
          imageurl,
          filename
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (updatedFetchError) {
      console.error('Error fetching updated item:', updatedFetchError);
      return res.status(500).json({ message: 'Item updated but error fetching data' });
    }

    // Transform the data to match the expected format
    const transformedItem = {
      id: updatedItem.id,
      title: updatedItem.title,
      description: updatedItem.description,
      status: updatedItem.status,
      location: updatedItem.location,
      dateLost: updatedItem.datelost,
      categoryId: updatedItem.categoryid,
      userId: updatedItem.userid,
      claimedBy: updatedItem.claimedby,
      claimedAt: updatedItem.claimedat,
      createdAt: updatedItem.createdat,
      userName: updatedItem.users?.name || null,
      categoryName: updatedItem.categories?.name || null,
      claimedByName: updatedItem.claimer?.name || null,
      images: (updatedItem.item_images || []).map(img => ({
        id: img.id,
        url: img.imageurl,
        filename: img.filename
      }))
    };
    
    res.json(transformedItem);
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
    
    // Check if item exists using Supabase
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (itemError) {
      if (itemError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Item not found' });
      }
      console.error('Error fetching item:', itemError);
      return res.status(500).json({ message: 'Error fetching item' });
    }
    
    // Get item owner information
    const { data: owner, error: ownerError } = await supabase
      .from('users')
      .select('id, name')
      .eq('id', item.userid)
      .single();

    if (ownerError) {
      console.error('Error fetching owner:', ownerError);
      return res.status(404).json({ message: 'Item owner not found' });
    }
    
    // For 'resolved' status, only the original reporter can resolve
    if (newStatus === 'resolved' && item.userid !== req.user.id) {
      return res.status(403).json({ 
        message: 'Only the person who reported this item can mark it as resolved' 
      });
    }
    
    // Get current user's name for notifications
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('name')
      .eq('id', req.user.id)
      .single();

    const userName = !userError && currentUser ? currentUser.name : 'A user';
    
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
        
        // Create notification using Supabase
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            userid: item.userid,
            senderid: req.user.id,
            itemid: item.id,
            message: message
          });
          
        if (notificationError) {
          console.error('Error creating notification:', notificationError);
        } else {
          console.log('Notification created successfully');
        }
        
        // Update item with claimedBy info but don't change status
        const { error: updateError } = await supabase
          .from('items')
          .update({
            claimedby: req.user.id,
            claimedat: new Date().toISOString()
          })
          .eq('id', req.params.id);
        
        if (updateError) {
          console.error('Error updating item with claim info:', updateError);
        } else {
          console.log('Item updated with claimedBy info');
        }
      } catch (err) {
        console.error('Error in notification process:', err);
        // Continue anyway to return the item
      }
      
      // Get the updated item using Supabase
      const { data: updatedItem, error: fetchError } = await supabase
        .from('items')
        .select(`
          *,
          users:userid (name),
          categories:categoryid (name)
        `)
        .eq('id', req.params.id)
        .single();
      
      if (fetchError) {
        console.error('Error fetching updated item:', fetchError);
        return res.status(500).json({ message: 'Item updated but error fetching data' });
      }

      let fullItemData = { 
        ...updatedItem, 
        notificationSent: true,
        userName: updatedItem.users?.name,
        categoryName: updatedItem.categories?.name
      };
      
      return res.json(fullItemData);
    }
    
    // For 'resolved' status, update the item status
    console.log('Updating item to resolved status');
    
    const { error: resolveError } = await supabase
      .from('items')
      .update({
        status: 'resolved',
        claimedby: req.user.id,
        claimedat: new Date().toISOString()
      })
      .eq('id', req.params.id);
    
    if (resolveError) {
      console.error('Error during status update:', resolveError);
      return res.status(500).json({ message: 'Error updating item status', error: resolveError.message });
    }
    
    // Get the updated item using Supabase
    const { data: finalUpdatedItem, error: finalFetchError } = await supabase
      .from('items')
      .select(`
        *,
        users:userid (name),
        categories:categoryid (name),
        claimer:claimedby (name)
      `)
      .eq('id', req.params.id)
      .single();
    
    if (finalFetchError) {
      console.error('Error fetching final updated item:', finalFetchError);
      return res.status(500).json({ message: 'Item updated but error fetching data' });
    }

    let fullItemData = { 
      ...finalUpdatedItem,
      userName: finalUpdatedItem.users?.name,
      categoryName: finalUpdatedItem.categories?.name,
      claimedByName: finalUpdatedItem.claimer?.name
    };
    
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
    // Check if item exists and belongs to user using Supabase
    const { data: item, error: fetchError } = await supabase
      .from('items')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Item not found' });
      }
      console.error('Error fetching item:', fetchError);
      return res.status(500).json({ message: 'Error fetching item' });
    }
    
    if (item.userid !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }
    
    // Delete associated images first
    const { error: deleteImagesError } = await supabase
      .from('item_images')
      .delete()
      .eq('itemid', req.params.id);

    if (deleteImagesError) {
      console.error('Error deleting item images:', deleteImagesError);
      // Continue with item deletion even if image deletion fails
    }
    
    // Delete the item
    const { error: deleteError } = await supabase
      .from('items')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) {
      console.error('Error deleting item:', deleteError);
      return res.status(500).json({ message: 'Error deleting item', error: deleteError.message });
    }
    
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
    
    // Check if item exists and belongs to user using Supabase
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('userid')
      .eq('id', itemId)
      .single();

    if (itemError) {
      if (itemError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Item not found' });
      }
      console.error('Error fetching item:', itemError);
      return res.status(500).json({ message: 'Error fetching item' });
    }
    
    if (item.userid !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this image' });
    }
    
    // Get image data
    const { data: imageData, error: imageError } = await supabase
      .from('item_images')
      .select('*')
      .eq('id', imageId)
      .eq('itemid', itemId)
      .single();

    if (imageError) {
      if (imageError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Image not found' });
      }
      console.error('Error fetching image:', imageError);
      return res.status(500).json({ message: 'Error fetching image' });
    }
    
    // Delete from database first
    const { error: deleteError } = await supabase
      .from('item_images')
      .delete()
      .eq('id', imageId);

    if (deleteError) {
      console.error('Error deleting image from database:', deleteError);
      return res.status(500).json({ message: 'Error deleting image', error: deleteError.message });
    }
    
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

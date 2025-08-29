import { supabase } from '../config/supabase';

// Helper function to transform Supabase responses to match axios format
const createResponse = (data, error = null) => {
  if (error) {
    throw {
      response: {
        data: { message: error.message },
        status: 500
      },
      message: error.message
    };
  }
  return { data };
};

// Items APIs
export const getItems = async () => {
  try {
    // First get all items
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('*')
      .order('createdat', { ascending: false });

    if (itemsError) throw itemsError;

    // Get all users to map names
    const { data: profiles, error: profilesError } = await supabase
      .from('users')
      .select('id, name');

    if (profilesError) throw profilesError;

    // Get all categories to map names
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name');

    if (categoriesError) throw categoriesError;

    // Create lookup maps
    const profileMap = (profiles || []).reduce((map, profile) => {
      map[profile.id] = profile.name;
      return map;
    }, {});

    const categoryMap = (categories || []).reduce((map, category) => {
      map[category.id] = category.name;
      return map;
    }, {});

    // Transform the data to match expected format
    const transformedItems = (items || []).map(item => ({
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
      userName: profileMap[item.userid] || null,
      categoryName: categoryMap[item.categoryid] || null,
      claimedByName: profileMap[item.claimedby] || null,
      images: [] // We'll handle images separately if needed
    }));

    return createResponse(transformedItems);
  } catch (error) {
    console.error('Error fetching items:', error);
    return createResponse(null, error);
  }
};

export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return createResponse(data || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return createResponse(null, error);
  }
};

export const getItem = async (id) => {
  try {
    // Get the item
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (itemError) throw itemError;

    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name')
      .eq('id', item.userid)
      .single();

    // Get category info
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('id', item.categoryid)
      .single();

    // Get claimer info if claimed
    let claimer = null;
    if (item.claimedby) {
      const { data: claimerData } = await supabase
        .from('users')
        .select('id, name')
        .eq('id', item.claimedby)
        .single();
      claimer = claimerData;
    }

    // Get item images
    const { data: images } = await supabase
      .from('item_images')
      .select('id, imageurl, filename')
      .eq('itemid', id);

    // Transform single item
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
      userName: user?.name || null,
      categoryName: category?.name || null,
      claimedByName: claimer?.name || null,
      images: (images || []).map(img => ({
        id: img.id,
        url: img.imageurl,
        filename: img.filename
      }))
    };

    return createResponse(transformedItem);
  } catch (error) {
    console.error('Error fetching item:', error);
    return createResponse(null, error);
  }
};

// Comments APIs
export const getItemComments = async (itemId) => {
  try {
    // Get comments
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('itemid', itemId)
      .order('createdat', { ascending: false });

    if (commentsError) throw commentsError;

    // Get all users for comment authors
    const userIds = [...new Set(comments.map(comment => comment.userid))];
    const { data: profiles, error: profilesError } = await supabase
      .from('users')
      .select('id, name')
      .in('id', userIds);

    const profileMap = (profiles || []).reduce((map, profile) => {
      map[profile.id] = profile.name;
      return map;
    }, {});

    // Transform comments
    const transformedComments = (comments || []).map(comment => ({
      id: comment.id,
      itemId: comment.itemid,
      userId: comment.userid,
      content: comment.content,
      createdAt: comment.createdat,
      userName: profileMap[comment.userid] || 'Unknown User'
    }));

    return createResponse(transformedComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return createResponse(null, error);
  }
};

export const addComment = async (commentData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('comments')
      .insert({
        itemid: commentData.itemId,
        userid: user.id,
        content: commentData.content
      })
      .select()
      .single();

    if (error) throw error;

    // Get user name for the response
    const { data: userData } = await supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single();

    const transformedComment = {
      id: data.id,
      itemId: data.itemid,
      userId: data.userid,
      content: data.content,
      createdAt: data.createdat,
      userName: userData?.name || 'Unknown User'
    };

    return createResponse(transformedComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    return createResponse(null, error);
  }
};

export const deleteComment = async (commentId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('userid', user.id);

    if (error) throw error;
    return createResponse({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return createResponse(null, error);
  }
};

// User Profile APIs  
export const getUserProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    // Get user's items
    const { data: userItems, error: itemsError } = await supabase
      .from('items')
      .select('*')
      .eq('userid', user.id)
      .order('createdat', { ascending: false });

    // Get categories for the items
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name');

    const categoryMap = (categories || []).reduce((map, category) => {
      map[category.id] = category.name;
      return map;
    }, {});

    const userData = {
      id: data.id,
      name: data.name,
      email: data.email,
      userType: data.usertype,
      department: data.department,
      semester: data.semester,
      contactInfo: data.contactinfo,
      createdAt: data.createdat
    };

    const items = (userItems || []).map(item => ({
      ...item,
      categoryName: categoryMap[item.categoryid] || null
    }));

    return createResponse({
      user: userData,
      items: items
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return createResponse(null, error);
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('users')
      .update({
        name: profileData.name,
        usertype: profileData.userType,
        department: profileData.department,
        semester: profileData.semester,
        contactinfo: profileData.contactInfo
      })
      .eq('id', user.id);

    if (error) throw error;

    // Fetch the updated user data
    const { data: updatedUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchError) throw fetchError;

    // Return the updated user data in the expected format
    const userData = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      userType: updatedUser.usertype,
      department: updatedUser.department,
      semester: updatedUser.semester,
      contactInfo: updatedUser.contactinfo
    };

    return createResponse(userData);
  } catch (error) {
    console.error('Error updating profile:', error);
    return createResponse(null, error);
  }
};

// Legacy authentication functions (for backward compatibility)
export const register = () => {
  throw new Error('Registration is now handled via OAuth2. Please use the Sign In button.');
};

export const login = () => {
  throw new Error('Login is now handled via OAuth2. Please use the Sign In button.');
};

export const getUserData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    return createResponse({ user });
  } catch (error) {
    return createResponse(null, error);
  }
};

export const getUserContact = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, contactinfo')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return createResponse(data);
  } catch (error) {
    console.error('Error fetching user contact:', error);
    return createResponse(null, error);
  }
};

// Additional missing functions
export const getItemStats = async () => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('status');

    if (error) throw error;

    // Group by status and count
    const statusCounts = (data || []).reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    // Convert to array format expected by Dashboard
    const statusCountsArray = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count: count.toString()
    }));

    return createResponse({ statusCounts: statusCountsArray });
  } catch (error) {
    console.error('Error fetching item stats:', error);
    return createResponse(null, error);
  }
};

export const createItem = async (itemData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Handle form data with potential image
    let itemPayload = {
      title: itemData.title,
      description: itemData.description,
      status: itemData.status,
      location: itemData.location,
      datelost: itemData.dateLost,
      categoryid: itemData.categoryId,
      userid: user.id
    };

    const { data, error } = await supabase
      .from('items')
      .insert(itemPayload)
      .select()
      .single();

    if (error) throw error;
    return createResponse(data);
  } catch (error) {
    console.error('Error creating item:', error);
    return createResponse(null, error);
  }
};

export const deleteItem = async (itemId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId)
      .eq('userid', user.id);

    if (error) throw error;
    return createResponse({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    return createResponse(null, error);
  }
};

export const claimItem = async (itemId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('items')
      .update({
        status: 'resolved',
        claimedby: user.id,
        claimedat: new Date().toISOString()
      })
      .eq('id', itemId);

    if (error) throw error;
    return createResponse({ message: 'Item claimed successfully' });
  } catch (error) {
    console.error('Error claiming item:', error);
    return createResponse(null, error);
  }
};

export const deleteItemImage = async (imageId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('item_images')
      .delete()
      .eq('id', imageId);

    if (error) throw error;
    return createResponse({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    return createResponse(null, error);
  }
};

// Notifications APIs
export const getNotifications = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('userid', user.id)
      .order('createdat', { ascending: false });

    if (error) throw error;

    // Get all users and items for notifications
    const senderIds = [...new Set(data.map(n => n.senderid).filter(Boolean))];
    const itemIds = [...new Set(data.map(n => n.itemid).filter(Boolean))];

    const { data: profiles } = await supabase
      .from('users')
      .select('id, name')
      .in('id', senderIds);

    const { data: items } = await supabase
      .from('items')
      .select('id, title')
      .in('id', itemIds);

    const profileMap = (profiles || []).reduce((map, profile) => {
      map[profile.id] = profile.name;
      return map;
    }, {});

    const itemMap = (items || []).reduce((map, item) => {
      map[item.id] = item.title;
      return map;
    }, {});

    const transformedNotifications = (data || []).map(notification => ({
      id: notification.id,
      userId: notification.userid,
      senderId: notification.senderid,
      itemId: notification.itemid,
      message: notification.message,
      isRead: notification.isread,
      createdAt: notification.createdat,
      senderName: profileMap[notification.senderid] || 'Unknown User',
      itemTitle: itemMap[notification.itemid] || 'Unknown Item'
    }));

    return createResponse(transformedNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return createResponse(null, error);
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('notifications')
      .update({ isread: true })
      .eq('id', notificationId)
      .eq('userid', user.id);

    if (error) throw error;
    return createResponse({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return createResponse(null, error);
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('userid', user.id);

    if (error) throw error;
    return createResponse({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return createResponse(null, error);
  }
};

// Password change (OAuth2 users don't need this, but keeping for compatibility)
export const changePassword = async () => {
  throw new Error('Password changes are not available for OAuth2 users. Manage your account through Google.');
};
const multer = require('multer');
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload image to Supabase Storage
const uploadToSupabase = async (file, folder = 'item-images') => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  // Generate unique filename
  const fileExtension = file.originalname.split('.').pop();
  const fileName = `${uuidv4()}.${fileExtension}`;
  const filePath = `${folder}/${fileName}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('lost-and-found-images')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error('Failed to upload image to storage');
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('lost-and-found-images')
    .getPublicUrl(filePath);

  return {
    url: publicUrl,
    path: filePath,
    filename: fileName,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  };
};

// Delete image from Supabase Storage
const deleteFromSupabase = async (filePath) => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase.storage
    .from('lost-and-found-images')
    .remove([filePath]);

  if (error) {
    console.error('Supabase delete error:', error);
    throw new Error('Failed to delete image from storage');
  }
};

module.exports = {
  upload,
  uploadToSupabase,
  deleteFromSupabase
};

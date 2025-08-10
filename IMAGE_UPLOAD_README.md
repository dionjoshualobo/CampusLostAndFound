# Image Upload Feature

This feature allows users to optionally upload images when reporting lost or found items.

## Architecture

### Database
- **item_images** table: Stores image metadata and links to Supabase Storage URLs
- Foreign key relationship with the `items` table
- Supports multiple images per item

### Storage
- **Supabase Storage**: Used for storing actual image files
- Bucket: `lost-and-found-images`
- File path structure: `item-images/{unique-filename}`

### Backend Changes
- Added `multer` middleware for handling multipart/form-data
- Added `@supabase/supabase-js` client for storage operations
- New routes:
  - `POST /api/items` - Now accepts optional image uploads
  - `DELETE /api/items/:id/images/:imageId` - Delete specific images
- Enhanced existing routes to include image data

### Frontend Changes
- **ItemForm**: Added optional file input with image preview
- **ItemCard**: Displays first image as card header (if available)
- **ItemDetails**: Full image gallery with modal view and delete functionality

## Setup Instructions

### 1. Supabase Setup
1. Create a Supabase project at https://supabase.com
2. Go to Storage → Buckets → Create bucket
3. Name it `lost-and-found-images`
4. Set it to **Public** bucket
5. Get your project URL and anon key from Settings → API

### 2. Environment Variables
Add to your backend `.env` file:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Migration
The `item_images` table is automatically created when the server starts.

## Features

### Image Upload
- **Optional**: Users can choose to upload an image or not
- **File validation**: Only image files allowed, max 5MB
- **Preview**: Users can see image preview before submitting
- **Error handling**: Graceful fallback if image upload fails

### Image Display
- **Card view**: First image shown as thumbnail on item cards
- **Gallery view**: All images displayed in item details
- **Modal viewer**: Click images to view in fullscreen modal
- **Navigation**: Previous/Next buttons for multiple images

### Image Management
- **Owner only**: Only item creators can delete images
- **Cleanup**: Failed uploads are automatically cleaned up
- **Error handling**: Graceful degradation if storage is unavailable

## File Limits
- **Maximum file size**: 5MB per image
- **Supported formats**: All common image formats (JPG, PNG, GIF, WebP, etc.)
- **Multiple images**: Unlimited images per item (within reasonable limits)

## Error Handling
- Storage unavailable: Items can still be created without images
- Upload failure: Clear error messages to users
- Missing images: Fallback placeholder or hide image sections
- Large files: Client-side validation with helpful error messages

## Security
- **File type validation**: Server-side validation of image MIME types
- **Size limits**: Both client and server-side size validation  
- **Unique filenames**: UUID-based naming prevents conflicts
- **User authorization**: Only item owners can delete images

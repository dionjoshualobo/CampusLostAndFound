# Supabase Storage Setup Instructions

## Step 1: Create Supabase Storage Bucket

1. **Log into Supabase Dashboard**
   - Go to https://supabase.com
   - Sign in to your account
   - Select your project: `sqnngwnxbnjwlxyutqmo`

2. **Create Storage Bucket**
   - Navigate to **Storage** in the left sidebar
   - Click **Create bucket**
   - Bucket name: `lost-and-found-images`
   - Make bucket **Public**: ✅ (checked)
   - Click **Create bucket**

3. **Configure Bucket Policies (Important!)**
   After creating the bucket, you need to set up RLS policies:
   
   ```sql
   -- Allow anyone to view images (for public viewing)
   create policy "Public Access" on storage.objects for select using (bucket_id = 'lost-and-found-images');
   
   -- Allow authenticated users to upload images
   create policy "Authenticated users can upload images" on storage.objects for insert with check (bucket_id = 'lost-and-found-images' and auth.role() = 'authenticated');
   
   -- Allow users to delete their own uploaded images
   create policy "Users can delete own images" on storage.objects for delete using (bucket_id = 'lost-and-found-images' and auth.uid()::text = (storage.foldername(name))[1]);
   ```

## Step 2: Test the Setup

1. **Restart your backend server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test image upload**
   - Go to your frontend application
   - Try creating a new item with an image
   - Check that the image uploads successfully

## Step 3: Verify Everything Works

✅ **Backend should show**: "Image uploaded successfully: [URL]"  
✅ **Frontend should**: Successfully create item with image  
✅ **Storage should**: Show uploaded files in the bucket  

## Alternative: Skip Image Upload for Now

If you want to test the basic functionality without setting up Supabase Storage:

1. The app is designed to work gracefully without image upload
2. Items will be created successfully, just without images
3. You can add the storage bucket later and images will start working

## Troubleshooting

**Error: "Bucket not found"**
- Make sure the bucket name is exactly `lost-and-found-images`
- Make sure the bucket is marked as **Public**

**Error: "Row Level Security policy violation"**
- Add the RLS policies mentioned in Step 3
- Make sure your Supabase RLS is properly configured

**Images not loading**
- Check that the bucket is **Public**
- Verify the image URLs are accessible directly in browser

-- Campus Lost and Found Database Schema for Supabase
-- This script sets up the database structure compatible with Supabase Auth

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- First, let's check if we need to modify existing tables
-- Drop existing foreign key constraints if they exist
DO $$ 
BEGIN
    -- Drop items foreign keys if they exist
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'items_userid_fkey' AND table_name = 'items') THEN
        ALTER TABLE public.items DROP CONSTRAINT items_userid_fkey;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'items_claimedby_fkey' AND table_name = 'items') THEN
        ALTER TABLE public.items DROP CONSTRAINT items_claimedby_fkey;
    END IF;
    
    -- Drop comments foreign key if it exists
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'comments_userid_fkey' AND table_name = 'comments') THEN
        ALTER TABLE public.comments DROP CONSTRAINT comments_userid_fkey;
    END IF;
    
    -- Drop notifications foreign keys if they exist
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'notifications_userid_fkey' AND table_name = 'notifications') THEN
        ALTER TABLE public.notifications DROP CONSTRAINT notifications_userid_fkey;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'notifications_senderid_fkey' AND table_name = 'notifications') THEN
        ALTER TABLE public.notifications DROP CONSTRAINT notifications_senderid_fkey;
    END IF;
END $$;

-- Create profiles table (linked to auth.users)
-- This replaces the custom users table and works with Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  usertype TEXT CHECK (usertype IN ('student', 'faculty', 'staff')) DEFAULT 'student',
  department TEXT,
  semester TEXT,
  contactinfo TEXT,
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO public.categories (name) VALUES
  ('Electronics'),
  ('Books'),
  ('Clothing'),
  ('Personal Items'),
  ('Documents'),
  ('Other')
ON CONFLICT (name) DO NOTHING;

-- Items table (updated to reference profiles)
-- First modify existing items table to use UUID for user references
DO $$
BEGIN
    -- Check if items table exists and modify columns if needed
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'items') THEN
        -- Add new UUID columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'items' AND column_name = 'userid_uuid') THEN
            ALTER TABLE public.items ADD COLUMN userid_uuid UUID;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'items' AND column_name = 'claimedby_uuid') THEN
            ALTER TABLE public.items ADD COLUMN claimedby_uuid UUID;
        END IF;
        
        -- Drop old columns if they exist
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'items' AND column_name = 'userid' AND data_type = 'integer') THEN
            ALTER TABLE public.items DROP COLUMN userid;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'items' AND column_name = 'claimedby' AND data_type = 'integer') THEN
            ALTER TABLE public.items DROP COLUMN claimedby;
        END IF;
        
        -- Rename UUID columns to the original names
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'items' AND column_name = 'userid_uuid') THEN
            ALTER TABLE public.items RENAME COLUMN userid_uuid TO userid;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'items' AND column_name = 'claimedby_uuid') THEN
            ALTER TABLE public.items RENAME COLUMN claimedby_uuid TO claimedby;
        END IF;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.items (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('lost', 'found', 'resolved')) NOT NULL,
  location TEXT,
  datelost DATE,
  categoryid INTEGER REFERENCES public.categories(id),
  userid UUID,
  claimedby UUID,
  claimedat TIMESTAMP WITH TIME ZONE,
  createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints after table creation
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'items_userid_fkey' AND table_name = 'items') THEN
        ALTER TABLE public.items ADD CONSTRAINT items_userid_fkey 
        FOREIGN KEY (userid) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'items_claimedby_fkey' AND table_name = 'items') THEN
        ALTER TABLE public.items ADD CONSTRAINT items_claimedby_fkey 
        FOREIGN KEY (claimedby) REFERENCES public.profiles(id);
    END IF;
END $$;

-- Enable RLS for items
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Policies for items table
CREATE POLICY "Items are viewable by everyone" ON public.items
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own items" ON public.items
  FOR INSERT WITH CHECK (auth.uid() = userid);

CREATE POLICY "Users can update their own items" ON public.items
  FOR UPDATE USING (auth.uid() = userid);

CREATE POLICY "Users can delete their own items" ON public.items
  FOR DELETE USING (auth.uid() = userid);

-- Item images table
CREATE TABLE IF NOT EXISTS public.item_images (
  id SERIAL PRIMARY KEY,
  itemid INTEGER REFERENCES public.items(id) ON DELETE CASCADE,
  imageurl TEXT NOT NULL,
  filename TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for item_images
ALTER TABLE public.item_images ENABLE ROW LEVEL SECURITY;

-- Policies for item_images
CREATE POLICY "Item images are viewable by everyone" ON public.item_images
  FOR SELECT USING (true);

CREATE POLICY "Users can manage images for their items" ON public.item_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.items 
      WHERE items.id = item_images.itemid 
      AND items.userid = auth.uid()
    )
  );

-- Comments table
-- Modify existing comments table to use UUID for user references
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
        -- Add new UUID column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'comments' AND column_name = 'userid_uuid') THEN
            ALTER TABLE public.comments ADD COLUMN userid_uuid UUID;
        END IF;
        
        -- Drop old column if it exists
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'comments' AND column_name = 'userid' AND data_type = 'integer') THEN
            ALTER TABLE public.comments DROP COLUMN userid;
        END IF;
        
        -- Rename UUID column to the original name
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'comments' AND column_name = 'userid_uuid') THEN
            ALTER TABLE public.comments RENAME COLUMN userid_uuid TO userid;
        END IF;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.comments (
  id SERIAL PRIMARY KEY,
  itemid INTEGER REFERENCES public.items(id) ON DELETE CASCADE,
  userid UUID,
  content TEXT NOT NULL,
  createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint after table creation
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'comments_userid_fkey' AND table_name = 'comments') THEN
        ALTER TABLE public.comments ADD CONSTRAINT comments_userid_fkey 
        FOREIGN KEY (userid) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Enable RLS for comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Policies for comments
CREATE POLICY "Comments are viewable by everyone" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = userid);

CREATE POLICY "Users can delete their own comments" ON public.comments
  FOR DELETE USING (auth.uid() = userid);

-- Notifications table
-- Modify existing notifications table to use UUID for user references
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        -- Add new UUID columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'notifications' AND column_name = 'userid_uuid') THEN
            ALTER TABLE public.notifications ADD COLUMN userid_uuid UUID;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'notifications' AND column_name = 'senderid_uuid') THEN
            ALTER TABLE public.notifications ADD COLUMN senderid_uuid UUID;
        END IF;
        
        -- Drop old columns if they exist
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'notifications' AND column_name = 'userid' AND data_type = 'integer') THEN
            ALTER TABLE public.notifications DROP COLUMN userid;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'notifications' AND column_name = 'senderid' AND data_type = 'integer') THEN
            ALTER TABLE public.notifications DROP COLUMN senderid;
        END IF;
        
        -- Rename UUID columns to the original names
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'notifications' AND column_name = 'userid_uuid') THEN
            ALTER TABLE public.notifications RENAME COLUMN userid_uuid TO userid;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'notifications' AND column_name = 'senderid_uuid') THEN
            ALTER TABLE public.notifications RENAME COLUMN senderid_uuid TO senderid;
        END IF;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.notifications (
  id SERIAL PRIMARY KEY,
  userid UUID,
  senderid UUID,
  itemid INTEGER REFERENCES public.items(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  isread BOOLEAN DEFAULT FALSE,
  createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints after table creation
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'notifications_userid_fkey' AND table_name = 'notifications') THEN
        ALTER TABLE public.notifications ADD CONSTRAINT notifications_userid_fkey 
        FOREIGN KEY (userid) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'notifications_senderid_fkey' AND table_name = 'notifications') THEN
        ALTER TABLE public.notifications ADD CONSTRAINT notifications_senderid_fkey 
        FOREIGN KEY (senderid) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = userid);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = userid);

CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = userid);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

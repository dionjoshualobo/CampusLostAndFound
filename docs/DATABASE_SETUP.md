# Database Setup Guide

This project uses **Supabase PostgreSQL** as the database backend with a custom authentication system using integer-based user IDs.

## Supabase Project Setup

### 1. Create a Supabase Project
- Go to [supabase.com](https://supabase.com) and create a new account
- Create a new project
- Note down your project URL and API keys from Settings → API

### 2. Get Your Credentials
- **SUPABASE_URL**: Your project URL from the API settings
- **SUPABASE_ANON_KEY**: The "anon public" key from API settings

### 3. Create Database Tables
Go to your Supabase dashboard → SQL Editor → New Query, and run the following SQL:

```sql
-- Create categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Note: User authentication is handled by Supabase Auth
-- Profile data is stored in the profiles table which is populated via Supabase triggers

-- Create items table
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    user_id INTEGER REFERENCES profiles(id),
    status VARCHAR(50) DEFAULT 'active',
    type VARCHAR(10) CHECK (type IN ('lost', 'found')) NOT NULL,
    location VARCHAR(255),
    date_lost_found DATE,
    contact_info TEXT,
    reward DECIMAL(10,2),
    claimed_by INTEGER REFERENCES profiles(id),
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create item_images table
CREATE TABLE item_images (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES profiles(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES profiles(id),
    item_id INTEGER REFERENCES items(id),
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Electronic devices and accessories'),
('Clothing', 'Clothes, shoes, and accessories'),
('Books', 'Books, notebooks, and study materials'),
('Personal Items', 'Wallets, keys, jewelry, etc.'),
('Sports Equipment', 'Sports gear and equipment'),
('Other', 'Items that don''t fit other categories');
```

### 4. Enable Row Level Security (Optional - handled by Supabase)
```sql
-- Note: Row Level Security is handled by Supabase Auth automatically
-- The profiles table is managed by Supabase Auth triggers
-- No additional RLS policies needed for profiles table

-- Items are publicly readable, users can only modify their own items
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Items are publicly readable" ON items FOR SELECT USING (true);
CREATE POLICY "Users can insert their own items" ON items FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own items" ON items FOR UPDATE USING (auth.uid()::text = user_id::text);  
CREATE POLICY "Users can delete their own items" ON items FOR DELETE USING (auth.uid()::text = user_id::text);

-- Comments are publicly readable, users can only modify their own comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are publicly readable" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can insert their own comments" ON comments FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE USING (auth.uid()::text = user_id::text);

-- Notifications are private to each user
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Item images follow the same policy as items
ALTER TABLE item_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Item images are publicly readable" ON item_images FOR SELECT USING (true);
CREATE POLICY "Users can manage images for their items" ON item_images 
    FOR ALL USING (EXISTS (SELECT 1 FROM items WHERE items.id = item_images.item_id AND auth.uid()::text = items.user_id::text));
```

### 5. Configure Storage (Optional)
For image uploads:
- Go to Storage in your Supabase dashboard
- Create a new bucket called `item-images`
- Set the bucket to public if you want images to be publicly accessible
- Configure upload policies as needed

## Database Schema

### Core Tables
- **users**: User information and authentication data
- **categories**: Item categories (Electronics, Clothing, Books, etc.)
- **items**: Lost and found items with status tracking
- **item_images**: Image attachments for items
- **comments**: User comments and interactions
- **notifications**: User notifications

### Database Relationships
```
users (1) ←→ (many) items
users (1) ←→ (many) comments  
users (1) ←→ (many) notifications
categories (1) ←→ (many) items
items (1) ←→ (many) item_images
items (1) ←→ (many) comments
items (1) ←→ (many) notifications
```

### Key Features
- Custom Authentication with integer-based user IDs
- Row Level Security enabled on all tables
- Foreign key relationships with referential integrity
- Supabase storage integration for item photos
- Real-time database capabilities

## Testing Database Connection
Use the database utilities to test connectivity:
```bash
cd src/server
node db-scripts/check-db.js          # Test PostgreSQL connection
node db-scripts/test-connection.js   # Test different connection formats
```
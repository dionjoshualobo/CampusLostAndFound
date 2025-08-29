# Campus Lost and Found

A full-stack web application for managing lost and found items on campus, built with React, Node.js, and Supabase.

## Features

- 🔐 **OAuth2 Authentication** with Google via Supabase Auth
- 📱 **Responsive Design** with Bootstrap
- 🔍 **Item Search and Filter** functionality
- 💬 **Comments System** for item discussions
- 🔔 **Real-time Notifications**
- 👤 **User Profiles** with department and contact info
- 📸 **Image Upload** for lost/found items
- 🏷️ **Category Management**

## Tech Stack

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Bootstrap 5** for styling
- **Supabase Client** for authentication and database

### Backend
- **Node.js** with Express
- **Supabase** for database and authentication
- **PostgreSQL** database
- **JWT** for session management

## Project Structure

```
CampusLostAndFound/
├── src/
│   ├── client/              # React frontend
│   │   ├── src/
│   │   │   ├── components/  # React components
│   │   │   ├── pages/       # Page components
│   │   │   ├── api/         # API client functions
│   │   │   ├── config/      # Configuration files
│   │   │   └── utils/       # Utility functions
│   │   ├── public/          # Static assets
│   │   ├── .env             # Environment variables
│   │   ├── .env.template    # Environment template
│   │   └── package.json
│   └── server/              # Node.js backend
│       ├── routes/          # Express routes
│       ├── middleware/      # Express middleware
│       ├── config/          # Database configuration
│       ├── .env             # Environment variables
│       ├── .env.template    # Environment template
│       └── package.json
├── README.md
└── .gitignore
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### 1. Clone the Repository
```bash
git clone https://github.com/dionjoshualobo/CampusLostAndFound.git
cd CampusLostAndFound
```

### 2. Environment Configuration

#### Frontend (.env)
Copy `src/client/.env.template` to `src/client/.env` and fill in your values:
```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_APP_NAME=Campus Lost and Found
```

#### Backend (.env)
Copy `src/server/.env.template` to `src/server/.env` and fill in your values:
```env
DATABASE_URL=your_postgresql_connection_string_here
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
JWT_SECRET=your_jwt_secret_here
PORT=5000
NODE_ENV=development
```

### 3. Database Setup
1. Create a new Supabase project
2. Enable Google OAuth in Supabase Auth settings
3. Run the database schema setup in Supabase SQL Editor
4. Configure Google OAuth2 credentials

### 4. Install Dependencies

#### Install all dependencies (recommended)
```bash
cd src/server
npm run install:all
```

#### Or install separately
```bash
# Frontend dependencies
cd src/client
npm install

# Backend dependencies
cd ../server
npm install
```

### 5. Run the Application

#### Development (both frontend and backend)
```bash
cd src/server
npm run dev
```

#### Run separately
```bash
# Frontend only (port 5173)
cd src/client
npm run dev

# Backend only (port 5000)
cd src/server
npm run dev:server
```

### 6. Build for Production
```bash
cd src/server
npm run build
```

## Available Scripts

### Server Package Scripts
- `npm run dev` - Run both frontend and backend in development
- `npm run dev:server` - Run backend only
- `npm run dev:client` - Run frontend only
- `npm run build` - Build for production
- `npm run start` - Start production servers
- `npm run install:all` - Install all dependencies

### Client Package Scripts
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Authentication Flow

1. User clicks "Sign In with Google"
2. Redirected to Google OAuth2
3. On success, Supabase automatically creates user profile
4. User is redirected back to the application
5. Frontend receives Supabase session token
6. User can access protected routes and features

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

```
src/
├── client/          # React frontend application
└── server/          # Express.js backend API
docs/               # Project documentation
scripts/            # Development and deployment scripts
```

See [PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) for detailed documentation.

## ✨ Features

- **User Authentication**: Secure registration and login system
- **Item Management**: Report lost items or post found items
- **Category System**: Organize items by categories
- **Status Tracking**: Track items through different statuses (lost, found, claimed, resolved)
- **Notifications**: Get notified when someone responds to your items
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend (`src/client/`)
- **React 18** with modern hooks
- **Vite** for fast development and building
- **React Router** for client-side routing
- **Axios** for API communication
- **Bootstrap** for responsive UI

### Backend (`src/server/`)
- **Node.js** with Express.js
- **PostgreSQL** database (Supabase)
- **JWT** for authentication
- **bcrypt** for password hashing
- **Multer** for file uploads
- **express-validator** for input validation

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Clone the repository
git clone https://github.com/dionjoshualobo/CampusLostAndFound.git
cd CampusLostAndFound

# Run the setup script
chmod +x scripts/setup.sh
./scripts/setup.sh

# Start development
npm run dev
```

### Option 2: Manual Setup
```bash
# Install dependencies
npm run install:all

# Start development servers
npm run dev              # Both client and server
npm run dev:client       # Frontend only (port 5173)
npm run dev:server       # Backend only (port 5000)
```

### Environment Variables
Create a `.env` file in `src/server/`:
```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Frontend
- **React.js** with functional components and hooks
- **Bootstrap 5** for styling
- **Axios** for API calls
- **React Router** for navigation

## Project Structure

```
CampusLostAndFound/
├── backend/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── middleware/
│   │   ├── auth.js            # Authentication middleware
│   │   └── validation.js      # Input validation middleware
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── categories.js     # Category management routes
│   │   ├── items.js          # Item management routes
│   │   └── notifications.js  # Notification routes
│   └── server.js             # Express server setup
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── App.js           # Main App component
│   │   ├── App.css          # Global styles with dark mode
│   │   └── index.js         # React entry point
│   └── package.json
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (via Supabase)
- npm or yarn

### Database Setup

This project uses **Supabase PostgreSQL** as the database backend. 

**Important:** This project uses a custom authentication system with integer-based user IDs, not Supabase Auth (which uses UUIDs).

#### Supabase Project Setup

1. **Create a Supabase project:**
   - Go to [supabase.com](https://supabase.com) and create a new account
   - Create a new project
   - Note down your project URL and API keys

2. **Create the required database tables:**
   Since Supabase tables cannot be created programmatically from the client SDK, you need to manually create them using the SQL editor in your Supabase dashboard.

   Go to your Supabase dashboard → SQL Editor → New Query, and run the following SQL commands:

   ```sql
   -- Create categories table
   CREATE TABLE categories (
       id SERIAL PRIMARY KEY,
       name VARCHAR(255) NOT NULL UNIQUE,
       description TEXT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Create users table
   CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       email VARCHAR(255) NOT NULL UNIQUE,
       password VARCHAR(255) NOT NULL,
       name VARCHAR(255) NOT NULL,
       phone VARCHAR(20),
       student_id VARCHAR(50),
       profile_completed BOOLEAN DEFAULT FALSE,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Create items table
   CREATE TABLE items (
       id SERIAL PRIMARY KEY,
       title VARCHAR(255) NOT NULL,
       description TEXT NOT NULL,
       category_id INTEGER REFERENCES categories(id),
       user_id INTEGER REFERENCES users(id),
       status VARCHAR(50) DEFAULT 'active',
       type VARCHAR(10) CHECK (type IN ('lost', 'found')) NOT NULL,
       location VARCHAR(255),
       date_lost_found DATE,
       contact_info TEXT,
       reward DECIMAL(10,2),
       claimed_by INTEGER REFERENCES users(id),
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
       user_id INTEGER REFERENCES users(id),
       content TEXT NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Create notifications table
   CREATE TABLE notifications (
       id SERIAL PRIMARY KEY,
       user_id INTEGER REFERENCES users(id),
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

   -- Enable Row Level Security (RLS) for better security
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE items ENABLE ROW LEVEL SECURITY;
   ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
   ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
   ALTER TABLE item_images ENABLE ROW LEVEL SECURITY;

   -- Create RLS policies (adjust as needed for your security requirements)
   -- Users can read all users but only update their own data
   CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
   CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);

   -- Items are publicly readable, users can only modify their own items
   CREATE POLICY "Items are publicly readable" ON items FOR SELECT USING (true);
   CREATE POLICY "Users can insert their own items" ON items FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
   CREATE POLICY "Users can update their own items" ON items FOR UPDATE USING (auth.uid()::text = user_id::text);
   CREATE POLICY "Users can delete their own items" ON items FOR DELETE USING (auth.uid()::text = user_id::text);

   -- Comments are publicly readable, users can only modify their own comments
   CREATE POLICY "Comments are publicly readable" ON comments FOR SELECT USING (true);
   CREATE POLICY "Users can insert their own comments" ON comments FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
   CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE USING (auth.uid()::text = user_id::text);
   CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE USING (auth.uid()::text = user_id::text);

   -- Notifications are private to each user
   CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid()::text = user_id::text);
   CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
   CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid()::text = user_id::text);

   -- Item images follow the same policy as items
   CREATE POLICY "Item images are publicly readable" ON item_images FOR SELECT USING (true);
   CREATE POLICY "Users can manage images for their items" ON item_images 
       FOR ALL USING (EXISTS (SELECT 1 FROM items WHERE items.id = item_images.item_id AND auth.uid()::text = items.user_id::text));
   ```

3. **Configure Supabase Storage (for image uploads):**
   - Go to Storage in your Supabase dashboard
   - Create a new bucket called `item-images`
   - Set the bucket to public if you want images to be publicly accessible
   - Configure upload policies as needed

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

3. Install dependencies:
```bash
npm install
```

4. Configure environment variables by creating a `.env` file in the backend directory:
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Server Configuration
PORT=5000

# Legacy Database Configuration (not used with Supabase)
# DB_HOST=localhost
# DB_USER=your_username
# DB_PASSWORD=your_password
# DB_NAME=campus_lost_found
```

**How to get your Supabase credentials:**
1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy the "Project URL" for `SUPABASE_URL`
4. Copy the "anon public" key for `SUPABASE_ANON_KEY`

**Generate a secure JWT secret:**
- In VS Code, open the terminal (Ctrl+` or Cmd+`)
- Run the following command to generate a random 64-character string:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
- Copy the generated string and use it as your `JWT_SECRET` value

5. Ensure your database tables are created following the Supabase setup instructions above.

6. Start the backend server:
```bash
npm start
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

**If you encounter dependency resolution errors:**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

3. Start the React development server:
```bash
npm run dev
```

The frontend application will run on `http://localhost:5173`

## Database Schema

The application uses the following main tables in Supabase PostgreSQL:

### Core Tables
- **users**: Store user information and authentication data (custom auth, not Supabase Auth)
- **categories**: Item categories for organization (Electronics, Clothing, Books, etc.)
- **items**: Lost and found items with status tracking and location data
- **item_images**: Image attachments for items with primary image designation
- **comments**: User comments and interactions on items
- **notifications**: User notifications for item interactions and updates

### Key Features
- **Custom Authentication**: Uses integer-based user IDs with bcrypt password hashing
- **Row Level Security**: Enabled on all tables with appropriate policies
- **Foreign Key Relationships**: Proper referential integrity between tables
- **Image Storage**: Supabase storage bucket integration for item photos
- **Real-time Capabilities**: Built on Supabase's real-time database features

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

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Items
- `GET /api/items` - Get all items
- `GET /api/items/stats` - Get item statistics
- `GET /api/items/:id` - Get specific item
- `POST /api/items` - Create new item (protected)
- `PUT /api/items/:id` - Update item (protected)
- `PUT /api/items/:id/claim` - Claim/resolve item (protected)
- `DELETE /api/items/:id` - Delete item (protected)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (protected)

### Notifications
- `GET /api/notifications` - Get user notifications (protected)
- `PUT /api/notifications/:id/read` - Mark notification as read (protected)

## Usage

1. **Register/Login**: Create an account or login to access the system
2. **Report Lost Item**: Fill out the form with item details, location, and date lost
3. **Post Found Item**: Report items you've found with description and location
4. **Browse Items**: View all lost and found items, filter by category
5. **Claim Items**: Notify item owners when you've found their lost items
6. **Resolve Items**: Mark items as resolved when they've been returned

## Features in Detail

### Item Status System
- **Lost**: Items that users have lost
- **Found**: Items that users have found
- **Claimed**: Items that have been claimed by someone
- **Resolved**: Items that have been successfully returned

### Notification System
- Users receive notifications when someone responds to their items
- Real-time updates on item status changes

### Dark Mode
- Toggle between light and dark themes
- Persistent theme preference
- Smooth transitions and animations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Deployment on Vercel

This project is configured for easy deployment on Vercel as a full-stack application:

### Prerequisites
- GitHub repository with your code
- Vercel account
- Environment variables set up

### Deployment Steps
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect the configuration from `vercel.json`
5. Add your environment variables in the Vercel dashboard:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - `JWT_SECRET` - Your JWT secret key
   - `PORT` - Server port (optional, defaults to 5000)
6. Click "Deploy"

### Important Notes
- The frontend will be served as static files from `/frontend/dist`
- The backend API will be available at `/api/*` routes
- Uses Supabase PostgreSQL with connection pooling optimized for serverless environments
- Environment variables should be properly configured in Vercel dashboard
- Ensure your Supabase project is properly configured with the required tables before deployment

## License

This project is open source and available under the MIT License.


# Campus Lost & Found System

A full-stack web application designed to help university students and faculty report, search, and claim lost or found items on campus.

## Features

- User authentication and profile management
- Report lost or found items with detailed descriptions
- Search and filter items by category, status, and keywords
- Comment system for each item
- Notification system for item claims
- Dashboard with summary statistics
- Status tracking (Lost, Found, Claimed, Resolved)
- Mobile responsive design

## Tech Stack

- **Frontend**: React.js, Bootstrap 5, Axios
- **Backend**: Node.js, Express.js
- **Database**: MySQL/MariaDB
- **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

- Node.js (v14 or higher)
- NPM (v6 or higher)
- MySQL, MariaDB, or compatible database system

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/campus-lost-found.git
cd campus-lost-found
```

### 2. Database Setup

This project works with MySQL and MariaDB. You can use any of the following database systems:
- MySQL (5.7 or higher)
- MariaDB (10.5 or higher)
- Amazon Aurora (MySQL compatible)
- Percona Server for MySQL

#### Database Creation

1. Log in to your MySQL/MariaDB server:
```bash
mysql -u root -p
```

2. Create a new database and user:
```sql
CREATE DATABASE lost_and_found;
CREATE USER 'lostfound_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON lost_and_found.* TO 'lostfound_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Environment Configuration

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a `.env` file from the example:
```bash
cp .env.example .env
```

3. Edit the `.env` file with your database credentials:
```properties
DB_HOST=localhost
DB_USER=lostfound_user
DB_PASSWORD=your_password
DB_NAME=lost_and_found
JWT_SECRET=generate_a_secure_random_string
PORT=5000
```

To generate a secure JWT secret, you can use the following command:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Backend Setup

1. Install backend dependencies:
```bash
cd backend
npm install
```

2. Set up the database tables:
```bash
cd db-scripts
node db-setup.js
```

This script will:
- Check database connection
- Create all required tables
- Set up foreign key relationships
- Add default categories

### 5. Frontend Setup

1. Install frontend dependencies:
```bash
cd frontend
npm install
```

## Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

The backend will be available at http://localhost:5000

### Start Frontend Development Server

In a new terminal:
```bash
cd frontend
npm run dev
```

The frontend will be available at http://localhost:5173

## Project Structure

```
campus-lost-found/
├── backend/                # Node.js & Express backend
│   ├── config/             # Database configuration
│   ├── db-scripts/         # Database setup and migration scripts
│   ├── middleware/         # Authentication middleware
│   ├── routes/             # API routes
│   └── server.js           # Entry point
│
└── frontend/               # React frontend
    ├── public/             # Static assets
    └── src/
        ├── api/            # API calls
        ├── components/     # Reusable components
        ├── pages/          # Page components
        └── utils/          # Utility functions
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/user` - Get authenticated user

### Items
- `GET /api/items` - List all items
- `GET /api/items/stats` - Get dashboard statistics
- `GET /api/items/:id` - Get item details
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `PUT /api/items/:id/claim` - Claim/resolve item
- `DELETE /api/items/:id` - Delete item

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password
- `GET /api/users/contact/:id` - Get user contact information

### Comments
- `GET /api/comments/item/:itemId` - Get comments for an item
- `POST /api/comments` - Add a comment
- `DELETE /api/comments/:id` - Delete a comment

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read

## Usage

1. **Registration and Login**: Users must create an account to report items or interact with the platform.

2. **Reporting Items**: 
   - Select whether the item is lost or found
   - Provide a descriptive title, category, and location
   - Add any relevant details that might help in identification

3. **Finding Items**:
   - Browse through listed items or use the search and filter options
   - View item details and comment for more information
   - Claim items that belong to you or that you've found

4. **Notifications**:
   - Get notified when someone claims to have found your lost item
   - Receive updates on items you've reported or interacted with


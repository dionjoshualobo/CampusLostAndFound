# Campus Lost and Found

A web application for managing lost and found items on campus. Students can report lost items, post found items, and connect with each other to recover lost belongings.

## Features

- **User Authentication**: Secure registration and login system
- **Item Management**: Report lost items or post found items
- **Category System**: Organize items by categories
- **Status Tracking**: Track items through different statuses (lost, found, claimed, resolved)
- **Notifications**: Get notified when someone responds to your items
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MySQL** database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation

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
This project uses **Supabase PostgreSQL** as the database backend. The database schema is automatically initialized when you start the backend server.

**Important:** This project uses a custom authentication system with integer-based user IDs, not Supabase Auth (which uses UUIDs).

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a MySQL database for the project

4. Configure environment variables by creating a `.env` file:
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=campus_lost_found
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

**Generate a secure JWT secret:**
- In VS Code, open the terminal (Ctrl+` or Cmd+`)
- Run the following command to generate a random 64-character string:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
- Copy the generated string and use it as your `JWT_SECRET` value

5. Set up the database tables (you'll need to create the schema based on the application requirements)

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

The application uses the following main tables:

- **users**: Store user information and authentication data
- **categories**: Item categories for organization
- **items**: Lost and found items with status tracking
- **notifications**: User notifications for item interactions

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

## License

This project is open source and available under the MIT License.


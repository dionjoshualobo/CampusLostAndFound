# Campus Lost and Found

A full-stack web application for managing lost and found items on campus, built with React, Node.js, and Supabase.

## ✨ Features

- 🔐 **User Authentication** - Secure registration and login system
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🔍 **Item Search and Filter** - Find items by category, location, or keywords
- 💬 **Comments System** - Communicate about items with other users
- 🔔 **Notifications** - Get notified about item responses and updates
- 📸 **Image Upload** - Attach photos to lost/found item reports
- 🏷️ **Category Management** - Organize items by type (Electronics, Clothing, etc.)
- 🌙 **Dark Mode** - Toggle between light and dark themes

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Bootstrap 5, React Router
- **Backend**: Node.js, Express.js, PostgreSQL (Supabase)
- **Authentication**: Custom JWT-based auth system
- **Database**: Supabase PostgreSQL with Row Level Security

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- Supabase account

### 1. Clone and Setup
```bash
git clone https://github.com/dionjoshualobo/CampusLostAndFound.git
cd CampusLostAndFound

# Install all dependencies
cd src/server
npm run install:all
```

### 2. Environment Configuration
Copy the template files and add your Supabase credentials:
```bash
# Backend environment
cp src/server/.env.template src/server/.env
# Frontend environment  
cp src/client/.env.template src/client/.env
```

**Backend (.env):**
```env
DATABASE_URL=your_postgresql_connection_string
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

**Frontend (.env):**
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_NAME=Campus Lost and Found
```

### 3. Database Setup
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Set up the required database tables (see [DATABASE_SETUP.md](docs/DATABASE_SETUP.md) for detailed instructions)

### 4. Run the Application
```bash
# Start both frontend and backend
cd src/server
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 📝 Available Scripts

From the `src/server` directory:
- `npm run dev` - Start both frontend and backend
- `npm run dev:server` - Start backend only
- `npm run dev:client` - Start frontend only  
- `npm run build` - Build for production
- `npm run start` - Start production servers

## 🎯 Usage

1. **Register/Login** - Create an account to access the system
2. **Report Items** - Post lost or found items with descriptions and photos
3. **Search & Browse** - Find items using filters and categories
4. **Communicate** - Comment on items to coordinate returns
5. **Claim & Resolve** - Mark items as claimed when returned

## 📁 Project Structure
```
src/
├── client/          # React frontend application
└── server/          # Express.js backend API
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

- [Database Setup Guide](docs/DATABASE_SETUP.md) - Detailed database configuration
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment instructions
- [API Documentation](docs/API.md) - Backend API endpoints reference

## 📄 License

This project is licensed under the MIT License.


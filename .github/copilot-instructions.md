# Campus Lost and Found - Developer Instructions

**ALWAYS follow these instructions first and fallback to additional search and context gathering only if the information here is incomplete or found to be in error.**

Campus Lost and Found is a full-stack React + Node.js web application for managing lost and found items on campus. The application uses React with Vite for the frontend, Express.js for the backend, and Supabase PostgreSQL for the database with custom authentication.

## Working Effectively

### Bootstrap and Setup
- **Install dependencies** (takes ~8-15 seconds):
  ```bash
  cd src/server
  npm run install:all
  ```
- **Environment Configuration** - Create environment files from templates:
  ```bash
  # Backend environment
  cp src/server/.env.template src/server/.env
  # Frontend environment  
  cp src/client/.env.template src/client/.env
  ```
- **CRITICAL: Fill in environment variables** in both `.env` files with your actual Supabase credentials:
  - Replace `your_supabase_project_url_here` with actual Supabase URL
  - Replace `your_supabase_anon_key_here` with actual anon key
  - Replace `your_jwt_secret_here` with a secure random string
  - **Without valid credentials, the server will crash on startup**
- **Build the application** (takes ~4 seconds):
  ```bash
  cd src/server
  npm run build
  ```

### Development Workflow
- **Start development servers** (both frontend and backend):
  ```bash
  cd src/server
  npm run dev
  ```
  - Backend runs on `http://localhost:5000` (or PORT from .env)
  - Frontend runs on `http://localhost:5173`
  - **NEVER CANCEL** - Servers start in ~5-10 seconds
- **Run servers separately if needed**:
  ```bash
  # Frontend only (port 5173)
  cd src/client
  npm run dev
  
  # Backend only (configurable port, default 5000)
  cd src/server
  npm run dev:server
  ```

### Build and Production
- **Production build** (takes ~4 seconds):
  ```bash
  cd src/server
  npm run build
  ```
- **Production servers**:
  ```bash
  cd src/server
  npm run start
  ```
  - Starts both production server (Node.js) and preview client (port 4173)

### Prerequisites and Environment
- **Node.js v18 or higher** (tested with v20.19.5)
- **npm** (package manager)
- **Supabase project** with PostgreSQL database

## Key Project Structure
```
src/
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components  
│   │   ├── api/         # API client functions
│   │   └── config/      # Supabase config
│   ├── .env            # Frontend environment variables
│   └── package.json    # Frontend dependencies
└── server/              # Express.js backend
    ├── routes/          # API routes (auth, items, categories, etc.)
    ├── middleware/      # Express middleware (auth, validation)
    ├── config/          # Database configuration
    ├── db-scripts/      # Database utilities
    ├── .env            # Backend environment variables
    └── package.json    # Backend dependencies & scripts
```

## Database Setup Requirements
**CRITICAL:** This project requires a Supabase PostgreSQL database with specific tables created manually. The application will NOT work without proper database setup.

### Required Database Tables
- **categories** - Item categories (Electronics, Clothing, etc.)
- **users** - Custom user authentication (integer IDs, not Supabase Auth UUIDs)
- **items** - Lost/found items with status tracking
- **item_images** - Image attachments for items  
- **comments** - User comments on items
- **notifications** - User notifications

### Database Connection Testing
Use these utilities to test database connectivity:
```bash
cd src/server
node db-scripts/check-db.js          # Test PostgreSQL connection
node db-scripts/test-connection.js   # Test different connection formats
```

## Validation and Testing

### Manual Application Testing
**ALWAYS manually test core functionality after changes:**
1. **Start development servers** and verify both start without errors
2. **Open browser** to `http://localhost:5173`
3. **Verify UI loads** - should show Campus Lost & Found header with navigation
4. **Test authentication flow** - Sign In button should be visible
5. **Check error handling** - with test credentials, should show "Failed to load data" gracefully
6. **Test theme toggle** - Dark mode button should work
7. **Verify responsive design** - UI should work on mobile and desktop

### No Automated Testing
- **No linting configured** - `npm run lint` outputs "No linting configured"
- **No tests configured** - `npm run test` outputs "Error: no test specified"
- **No code formatting tools** - Manual code review required

## Environment Configuration

### Backend (.env in src/server/)
```env
DATABASE_URL=your_postgresql_connection_string
SUPABASE_URL=your_supabase_project_url  
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret_here
PORT=5000
NODE_ENV=development
```

### Frontend (.env in src/client/)
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_NAME=Campus Lost and Found
```

## Common Issues and Solutions

### Environment Variable Issues
**CRITICAL:** Template environment variables will cause server crashes:
- **Error: "TypeError: Invalid URL"** - Replace template values with real Supabase credentials
- **Server crashes on startup** - Verify all environment variables are properly configured
- **Frontend loads but no data** - Check Supabase URL and keys are correct

### Port Conflicts
If you get "EADDRINUSE" errors:
- Change `PORT=5001` in `src/server/.env` 
- Kill existing processes: `pkill -f "node.*server.js"`

### Database Connection Failures
With valid credentials but no database setup:
- Application shows "Failed to load data" message - this is expected
- Database utilities will show connection errors - normal without proper schema

### Build Dependencies
The application has some deprecated dependency warnings but builds successfully. These warnings do not affect functionality:
- rimraf@3.0.2, npmlog@5.0.1, inflight@1.0.6, gauge@3.0.2, glob@7.2.3, are-we-there-yet@2.0.0

## API Endpoints Overview
- **Authentication**: `/api/auth/*` (register, login, profile)
- **Items**: `/api/items/*` (CRUD operations, search, claim)
- **Categories**: `/api/categories/*` (list, manage categories)
- **Users**: `/api/users/*` (user management)
- **Comments**: `/api/comments/*` (item discussions)
- **Notifications**: `/api/notifications/*` (user alerts)

## Deployment
- **Vercel configuration** included in `vercel.json`
- **Production build** outputs to `src/client/dist/`
- **Static file serving** - Express serves React build from `/src/client/dist`

## Important Notes for Development
- **Always test with real database** for full functionality validation
- **Environment variables are required** - app will fail gracefully without them
- **Custom authentication** - Uses integer user IDs, not Supabase Auth UUIDs
- **No backend compilation** - Node.js runs source files directly
- **Frontend uses Vite** - Fast development server with hot reload
- **Concurrent development** - Single command runs both frontend and backend

## Common Tasks Reference

### Repository Root Contents
```
.github/                 # GitHub configuration
.gitignore              # Git ignore patterns
README.md               # Project documentation
package.json            # Root package configuration (legacy)
src/                    # Source code
├── client/            # React frontend
└── server/            # Express backend
vercel.json            # Vercel deployment configuration
```

### Available npm Scripts (from src/server)
- `npm run dev` - Start both frontend and backend in development
- `npm run dev:server` - Start backend only
- `npm run dev:client` - Start frontend only  
- `npm run build` - Build for production
- `npm run start` - Start production servers
- `npm run install:all` - Install all dependencies
- `npm run test` - Run tests (outputs "no test specified")
- `npm run lint` - Run linting (outputs "no linting configured")

### Key Environment Variables Quick Reference
**Backend (.env):** DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, JWT_SECRET, PORT
**Frontend (.env):** VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_APP_NAME
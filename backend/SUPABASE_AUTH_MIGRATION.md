# Supabase Authentication Migration Guide

## 🔄 What Changed

### Backend Changes
1. **New Dependencies**: Added `@supabase/supabase-js`
2. **Database Schema**: Changed from `users` table to `user_profiles` table that references Supabase auth users
3. **Authentication**: Now uses Supabase Auth instead of custom JWT
4. **New Routes**: `/api/auth` now uses Supabase authentication endpoints

### Frontend Changes Required
1. **Token Storage**: Uses `access_token` and `refresh_token` instead of single `token`
2. **API Updates**: Authentication API calls updated for Supabase

### Database Changes
- **Old**: `users` table with `id` (SERIAL), `passwordHash`, etc.
- **New**: `user_profiles` table with `id` (UUID) referencing `auth.users`

## 🚀 Setup Instructions

### 1. Backend Setup
The backend is already configured! Just make sure your `.env` has:
```
DATABASE_URL=postgresql://postgres:your_password@db.sqnngwnxbnjwlxyutqmo.supabase.co:5432/postgres
SUPABASE_URL=https://sqnngwnxbnjwlxyutqmo.supabase.co
SUPABASE_ANON_KEY=your_anon_key
JWT_SECRET=your_jwt_secret
```

### 2. Frontend Setup
Create `.env` file in frontend directory:
```
VITE_SUPABASE_URL=https://sqnngwnxbnjwlxyutqmo.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:5000/api
```

### 3. Enable Row Level Security (Recommended)
In your Supabase dashboard:
1. Go to Authentication → Policies
2. Enable RLS on `user_profiles` table
3. Create policies for user access

## 🔧 Migration Process

### Automatic Migration
When you start the backend:
1. It will create the new `user_profiles` table
2. Existing users will need to re-register (authentication is now handled by Supabase)
3. User profiles will be created automatically on first login

### Manual Data Migration (if needed)
If you have existing users you want to migrate:
1. Export existing user data
2. Create Supabase auth users
3. Insert corresponding profiles in `user_profiles` table

## 📱 Frontend Updates Needed

### Login/Register Components
Update authentication flow to handle:
- `access_token` and `refresh_token`
- New response format from Supabase

### Token Management
- Store `access_token` instead of `token`
- Handle token refresh with `refresh_token`
- Implement automatic token refresh

### API Calls
- Updated authentication endpoints
- No more password change endpoint (handled by Supabase)

## 🎯 Benefits of Supabase Auth

1. **Security**: Built-in security features and best practices
2. **Features**: Email verification, password reset, social login ready
3. **Scalability**: Handles user management at scale
4. **Maintenance**: Less auth code to maintain

## 🔄 Testing the Migration

### Backend Test
```bash
cd backend
npm start
# Check that server starts and creates user_profiles table
```

### Frontend Test
```bash
cd frontend
# Create .env file with Supabase credentials
npm run dev
# Test registration and login
```

### API Test
```bash
# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## ⚠️ Important Notes

1. **Existing Users**: Will need to re-register since we switched to Supabase Auth
2. **Email Verification**: Supabase may require email verification (configurable)
3. **Password Policies**: Now controlled by Supabase settings
4. **Social Login**: Can be enabled later in Supabase dashboard

## 🔙 Rollback Plan

If needed, you can rollback by:
1. Reverting to original `routes/auth.js`
2. Using original `middleware/auth.js`
3. Switching back to `users` table
4. Removing Supabase dependencies

The original files are backed up as `*_backup.js` files.

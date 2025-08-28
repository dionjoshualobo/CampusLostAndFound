# Database Setup Instructions for OAuth2 Implementation

## Problem
The current authentication error occurs because Supabase OAuth2 tries to automatically create user records in a custom `users` table that isn't compatible with Supabase's authentication system.

## Solution
We need to restructure the database to use Supabase's recommended pattern:
- Use the built-in `auth.users` table for authentication
- Create a `profiles` table for custom user data
- Set up proper triggers to automatically create profiles when users sign up

## Steps to Fix

### 1. Run the Database Schema Script

Execute the `supabase-schema.sql` file in your Supabase SQL Editor:

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the script

This will:
- Create a new `profiles` table linked to `auth.users`
- Set up proper Row Level Security (RLS) policies
- Create a trigger to automatically create profiles for new OAuth2 users
- Update all existing tables to reference `profiles` instead of `users`

### 2. Migrate Existing Data (if any)

If you have existing user data in a custom `users` table, you'll need to migrate it:

```sql
-- Only run this if you have existing data in a 'users' table
INSERT INTO public.profiles (id, name, email, usertype, department, semester, contactinfo, profile_completed)
SELECT id, name, email, usertype, department, semester, contactinfo, profile_completed
FROM public.users
ON CONFLICT (id) DO NOTHING;

-- Update any existing items to ensure they reference the correct user IDs
-- (This should already be correct if using UUIDs)
```

### 3. Clean Up Old Tables (optional)

After confirming everything works:

```sql
-- Only run this after confirming the migration worked
DROP TABLE IF EXISTS public.users;
```

## How This Fixes the Authentication Error

1. **Automatic Profile Creation**: When a user signs in with Google OAuth2, Supabase automatically creates a record in `auth.users`
2. **Trigger Execution**: Our trigger `on_auth_user_created` automatically creates a corresponding record in `profiles` 
3. **Seamless Integration**: The frontend API now uses `profiles` table, which is properly linked to Supabase Auth
4. **Proper Permissions**: RLS policies ensure users can only access their own data

## Key Benefits

- **OAuth2 Compatible**: Works seamlessly with Supabase's built-in OAuth2 providers
- **Secure**: Proper Row Level Security policies protect user data
- **Automatic**: No manual user creation needed - everything happens automatically
- **Scalable**: Follows Supabase's recommended patterns for production apps

## Testing

After running the schema:
1. Clear your browser's local storage/cookies for localhost:5173
2. Try signing in with Google OAuth2 again
3. The authentication should work without errors
4. A profile should be automatically created in the `profiles` table

## Note

The frontend code has been updated to use the `profiles` table instead of `users` table for all API calls.

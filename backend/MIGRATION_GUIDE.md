# Migration from MySQL to PostgreSQL (Supabase)

## Backend Changes Made

### 1. Package Dependencies
- **Removed**: `mysql2`
- **Added**: `pg` (PostgreSQL driver)

### 2. Database Configuration (`config/db.js`)
- Changed from MySQL connection pool to PostgreSQL pool
- Updated to use Supabase connection string format
- Replaced MySQL-specific syntax with PostgreSQL equivalent:
  - `INT AUTO_INCREMENT` → `SERIAL`
  - `ENUM('value1', 'value2')` → `VARCHAR(20) CHECK (column IN ('value1', 'value2'))`
  - `INSERT IGNORE` → `INSERT ... ON CONFLICT ... DO NOTHING`

### 3. Query Syntax Updates
All route files updated to use PostgreSQL syntax:
- Parameter placeholders: `?` → `$1, $2, $3...`
- Query methods: `db.execute()` → `db.query()`
- Result structure: `[rows]` → `result.rows`
- Insert returning ID: `result.insertId` → `RETURNING id` clause

### 4. Files Modified
- `package.json` - Updated dependencies
- `config/db.js` - Complete rewrite for PostgreSQL
- `server.js` - Updated connection testing
- `routes/auth.js` - PostgreSQL query syntax
- `routes/items.js` - PostgreSQL query syntax + removed MySQL-specific ENUM handling
- `routes/users.js` - PostgreSQL query syntax + information_schema queries
- `routes/categories.js` - PostgreSQL query syntax
- `routes/comments.js` - PostgreSQL query syntax
- `routes/notifications.js` - PostgreSQL query syntax
- `db-scripts/check-db.js` - PostgreSQL version
- `db-scripts/validate-db.js` - PostgreSQL version

### 5. Database Schema Changes
PostgreSQL equivalent schema:
- All `AUTO_INCREMENT` fields → `SERIAL`
- All `ENUM` types → `VARCHAR` with `CHECK` constraints
- Column names are case-insensitive in PostgreSQL (lowercased)

## Setup Instructions

### 1. Create Supabase Project
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready

### 2. Get Database Credentials
1. In your Supabase project dashboard, go to Settings > Database
2. Copy the connection string under "Connection string"
3. It will look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`

### 3. Configure Environment
1. Copy `.env.template` to `.env`
2. Replace `[YOUR_PASSWORD]` with your actual database password
3. Replace `[YOUR_PROJECT_REF]` with your project reference
4. Set a strong JWT_SECRET

### 4. Install Dependencies & Run
```bash
cd backend
npm install
npm start
```

The application will automatically create the required tables on first run.

### 5. Test Database Connection
```bash
cd backend/db-scripts
node check-db.js
node validate-db.js
```

## Key Differences from MySQL

1. **Case Sensitivity**: PostgreSQL lowercases column names by default
2. **Parameter Binding**: Uses `$1, $2` instead of `?`
3. **RETURNING Clause**: For getting inserted IDs
4. **Information Schema**: Different system tables for metadata
5. **No ENUM**: Uses VARCHAR with CHECK constraints instead

## Frontend Changes Required
**None!** All API endpoints remain the same. The frontend doesn't need any changes.

## Rollback Plan
If you need to rollback to MySQL:
1. Restore original files from `*_mysql_backup.js` files
2. `npm uninstall pg && npm install mysql2`
3. Update `.env` with MySQL credentials
4. Use original `config/db.js`

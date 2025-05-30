# Database Management Scripts

This directory contains utility scripts for managing the database schema and validation.

## Available Scripts

- `check-db.js` - Verify database connection
- `fix-db.js` - Fix database schema issues
- `fix-schema.js` - Update user table schema
- `fix-status-enum.js` - Fix status enum in items table
- `notification-schema.js` - Create notifications table
- `validate-db.js` - Comprehensive database validation
- `db-setup.js` - Run all scripts in sequence

## Usage

To run all database setup and validation in order:

```bash
node db-setup.js
```

To run individual scripts:

```bash
node check-db.js
node fix-db.js
# etc.
```

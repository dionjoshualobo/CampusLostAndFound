# Project Structure

This document explains the organization of the Campus Lost and Found codebase.

## Directory Structure

```
campus-lost-and-found/
├── src/                           # Source code
│   ├── client/                    # Frontend React application
│   │   ├── public/               # Static assets
│   │   ├── src/                  # React source code
│   │   │   ├── components/       # Reusable UI components
│   │   │   ├── pages/           # Page components
│   │   │   ├── api/             # API client functions
│   │   │   ├── utils/           # Utility functions
│   │   │   ├── App.jsx          # Main app component
│   │   │   └── main.jsx         # Entry point
│   │   ├── package.json         # Client dependencies
│   │   └── vite.config.js       # Vite configuration
│   │
│   └── server/                   # Backend Express application
│       ├── config/              # Configuration files
│       ├── db-scripts/          # Database scripts
│       ├── middleware/          # Express middleware
│       ├── routes/              # API route handlers
│       ├── server.js            # Server entry point
│       └── package.json         # Server dependencies
│
├── docs/                         # Documentation
│   └── PROJECT_STRUCTURE.md     # This file
│
├── scripts/                      # Build and deployment scripts
│
├── package.json                  # Root package.json for monorepo
├── vercel.json                   # Vercel deployment configuration
├── .gitignore                    # Git ignore patterns
└── README.md                     # Project overview
```

## Key Principles

### 1. **Monorepo Structure**
- Single repository containing both client and server code
- Shared tooling and scripts at the root level
- Independent package.json files for client and server

### 2. **Clear Separation of Concerns**
- `src/client/` - All frontend code (React, Vite, UI components)
- `src/server/` - All backend code (Express, APIs, database)
- `docs/` - Documentation and guides
- `scripts/` - Build, deployment, and utility scripts

### 3. **Standardized Naming**
- Folders use kebab-case: `lost-items`, `user-profile`
- Components use PascalCase: `ItemCard.jsx`, `UserProfile.jsx`
- Files use camelCase: `dateUtils.js`, `apiClient.js`

### 4. **Environment Management**
- Environment variables in respective `.env` files
- Development vs production configurations
- Secure handling of API keys and secrets

## Development Workflow

### Starting Development
```bash
npm run dev          # Start both client and server
npm run dev:client   # Start only client
npm run dev:server   # Start only server
```

### Building
```bash
npm run build        # Build client for production
npm run build:client # Build client
npm run build:server # Build server (if needed)
```

### Testing
```bash
npm test             # Run all tests
npm run test:client  # Run client tests
npm run test:server  # Run server tests
```

## Deployment

- **Frontend**: Deployed to Vercel as static site
- **Backend**: Can be deployed to Railway, Render, or Heroku
- **Database**: PostgreSQL (Supabase)

## Contributing

1. Follow the established folder structure
2. Use consistent naming conventions
3. Add documentation for new features
4. Write tests for new functionality
5. Update this document when adding new directories

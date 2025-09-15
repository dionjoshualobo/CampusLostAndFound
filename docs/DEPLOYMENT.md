# Deployment Guide

This guide covers deploying the Campus Lost and Found application to production.

## Vercel Deployment (Recommended)

This project is configured for easy deployment on Vercel as a full-stack application.

### Prerequisites
- GitHub repository with your code
- Vercel account
- Supabase project with database tables set up
- Environment variables configured

### Deployment Steps

1. **Sign in to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in with your GitHub account

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the configuration from `vercel.json`

3. **Configure Environment Variables**
   Add the following environment variables in the Vercel dashboard:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   JWT_SECRET=your_jwt_secret_key
   DATABASE_URL=your_postgresql_connection_string
   PORT=5000
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application

### Important Notes
- The frontend will be served as static files from `src/client/dist`
- The backend API will be available at `/api/*` routes
- Uses Supabase PostgreSQL with connection pooling optimized for serverless
- Ensure your Supabase project has all required tables before deployment

## Manual Production Build

If you want to build and run the application manually:

### 1. Build for Production
```bash
cd src/server
npm run build
```

### 2. Start Production Server
```bash
npm run start
```

This will:
- Start the Node.js backend server
- Serve the React frontend from the built static files
- Run on the configured PORT (default: 5000)

## Environment Configuration

### Required Environment Variables

**Backend (.env in src/server/):**
```env
# Database
DATABASE_URL=your_postgresql_connection_string
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Authentication
JWT_SECRET=your_jwt_secret_here

# Server
PORT=5000
NODE_ENV=production
```

**Frontend (.env in src/client/):**
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_NAME=Campus Lost and Found
```

### Generating a JWT Secret
Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Pre-Deployment Checklist

- [ ] Supabase project created and configured
- [ ] All database tables created (see [DATABASE_SETUP.md](DATABASE_SETUP.md))
- [ ] Environment variables configured
- [ ] Application builds successfully (`npm run build`)
- [ ] Database connection tested
- [ ] Image upload storage configured (if using)

## Troubleshooting

### Common Deployment Issues

**Build Failures:**
- Ensure all dependencies are properly listed in package.json
- Check for environment variable misconfigurations
- Verify Node.js version compatibility (v18+)

**Database Connection Issues:**
- Verify Supabase credentials are correct
- Check that all required tables exist
- Ensure Row Level Security policies are properly configured

**Image Upload Problems:**
- Verify Supabase Storage bucket is created
- Check bucket permissions and policies
- Ensure image URLs are accessible

### Performance Optimization

- Enable gzip compression in production
- Use CDN for static assets
- Configure proper caching headers
- Monitor database query performance
- Set up error logging and monitoring

## Monitoring and Maintenance

### Recommended Monitoring
- Vercel Analytics for frontend performance
- Supabase Dashboard for database metrics
- Application error tracking (Sentry, LogRocket, etc.)
- Uptime monitoring

### Regular Maintenance
- Monitor database storage usage
- Review and optimize slow queries
- Update dependencies regularly
- Back up database regularly
- Monitor application logs for errors

## Scaling Considerations

### Database Scaling
- Monitor connection pool usage
- Consider read replicas for heavy read workloads
- Optimize database indexes for frequently queried fields
- Consider connection pooling optimizations

### Application Scaling
- Vercel automatically scales serverless functions
- Consider caching strategies for frequently accessed data
- Monitor API response times
- Implement proper error handling and retry logic
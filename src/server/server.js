require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const commentRoutes = require('./routes/comments');
const notificationRoutes = require('./routes/notifications');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Test database connection and setup routes
db.connect()
  .then(client => {
    console.log('Database connected successfully');
    client.release();
    
    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/items', itemRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/categories', categoryRoutes);
    app.use('/api/comments', commentRoutes);
    app.use('/api/notifications', notificationRoutes);
    
    app.get('/', (req, res) => {
      res.send('Lost and Found API is running');
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

// For Vercel deployment
module.exports = app;

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

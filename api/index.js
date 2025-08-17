const express = require('express');
const cors = require('cors');
const authRoutes = require('../backend/routes/auth');
const itemRoutes = require('../backend/routes/items');
const userRoutes = require('../backend/routes/users');
const categoryRoutes = require('../backend/routes/categories');
const commentRoutes = require('../backend/routes/comments');
const notificationRoutes = require('../backend/routes/notifications');

const app = express();

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api', (req, res) => {
  res.send('Lost and Found API is running');
});

module.exports = app;

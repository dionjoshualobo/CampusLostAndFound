const jwt = require('jsonwebtoken');
const supabase = require('../config/db');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Try to verify as Supabase JWT token first
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        throw new Error('Invalid Supabase token');
      }
      
      // Add user info to request
      req.user = {
        id: user.id,
        email: user.email,
        // Add other user fields as needed
      };
      
      return next();
    } catch (supabaseError) {
      // Fallback to legacy JWT verification for backward compatibility
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        return next();
      } catch (jwtError) {
        console.error('Token verification failed:', { supabaseError, jwtError });
        return res.status(401).json({ message: 'Token is not valid' });
      }
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ message: 'Server error during authentication' });
  }
};

module.exports = authMiddleware;

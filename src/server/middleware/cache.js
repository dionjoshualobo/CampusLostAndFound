const { getCache, setCache } = require('../config/redis');

// Cache middleware factory
const cacheMiddleware = (keyPrefix, expirationInSeconds = 300) => {
  return async (req, res, next) => {
    // Generate cache key based on request
    const cacheKey = `${keyPrefix}:${req.user?.id || 'guest'}:${req.originalUrl}`;
    
    try {
      // Try to get cached data
      const cachedData = await getCache(cacheKey);
      
      if (cachedData) {
        console.log(`Cache HIT: ${cacheKey}`);
        return res.json(cachedData);
      }
      
      console.log(`Cache MISS: ${cacheKey}`);
      
      // Store original res.json function
      const originalJson = res.json.bind(res);
      
      // Override res.json to cache the response
      res.json = function(data) {
        // Cache successful responses only
        if (res.statusCode >= 200 && res.statusCode < 300) {
          setCache(cacheKey, data, expirationInSeconds)
            .catch(err => console.error('Failed to cache response:', err));
        }
        
        // Call original json function
        return originalJson(data);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      // Continue without caching on error
      next();
    }
  };
};

module.exports = { cacheMiddleware };

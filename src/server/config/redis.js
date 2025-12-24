const redis = require('redis');

// Redis client instance
let redisClient = null;
let isRedisConnected = false;

// Initialize Redis client
const initRedis = async () => {
  try {
    // Use Redis URL from environment or default to localhost
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = redis.createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.log('Redis: Max reconnection attempts reached');
            return new Error('Redis max reconnection attempts reached');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('Redis: Connecting...');
    });

    redisClient.on('ready', () => {
      console.log('Redis: Connected successfully');
      isRedisConnected = true;
    });

    redisClient.on('end', () => {
      console.log('Redis: Connection closed');
      isRedisConnected = false;
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.warn('Redis initialization failed:', error.message);
    console.warn('Continuing without Redis caching...');
    isRedisConnected = false;
    return null;
  }
};

// Get cached data
const getCache = async (key) => {
  if (!isRedisConnected || !redisClient) {
    return null;
  }
  
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

// Set cached data with optional expiration (in seconds)
const setCache = async (key, value, expirationInSeconds = 300) => {
  if (!isRedisConnected || !redisClient) {
    return false;
  }
  
  try {
    await redisClient.setEx(key, expirationInSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
};

// Delete cached data
const deleteCache = async (key) => {
  if (!isRedisConnected || !redisClient) {
    return false;
  }
  
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Redis delete error:', error);
    return false;
  }
};

// Delete all keys matching a pattern
const deleteCachePattern = async (pattern) => {
  if (!isRedisConnected || !redisClient) {
    return false;
  }
  
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    console.error('Redis delete pattern error:', error);
    return false;
  }
};

// Check if Redis is available
const isRedisAvailable = () => isRedisConnected;

// Close Redis connection
const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
  }
};

module.exports = {
  initRedis,
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
  isRedisAvailable,
  closeRedis
};

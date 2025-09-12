/**
 * Simple in-memory cache service for API responses
 * Provides caching with TTL (Time To Live) and invalidation capabilities
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map(); // Store expiration times
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  }

  /**
   * Generate a cache key from function name and arguments
   */
  _generateKey(functionName, ...args) {
    return `${functionName}:${JSON.stringify(args)}`;
  }

  /**
   * Check if a cache entry is expired
   */
  _isExpired(key) {
    const expirationTime = this.ttl.get(key);
    if (!expirationTime) return true;
    return Date.now() > expirationTime;
  }

  /**
   * Get data from cache
   */
  get(key) {
    if (this._isExpired(key)) {
      this.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  /**
   * Set data in cache with TTL
   */
  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, data);
    this.ttl.set(key, Date.now() + ttl);
  }

  /**
   * Delete specific cache entry
   */
  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
    this.ttl.clear();
  }

  /**
   * Clear cache entries by pattern (prefix matching)
   */
  clearByPattern(pattern) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.delete(key));
  }

  /**
   * Wrapper function to cache API calls
   */
  async withCache(functionName, apiFunction, args = [], ttl = this.defaultTTL) {
    const cacheKey = this._generateKey(functionName, ...args);
    
    // Try to get from cache first
    const cachedData = this.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for ${functionName}`, args);
      return cachedData;
    }

    // If not in cache, call the API
    console.log(`Cache miss for ${functionName}`, args);
    try {
      const result = await apiFunction(...args);
      this.set(cacheKey, result, ttl);
      return result;
    } catch (error) {
      // Don't cache errors
      throw error;
    }
  }

  /**
   * Invalidate cache for specific items and related data
   */
  invalidateItem(itemId) {
    // Clear specific item cache
    this.clearByPattern(`getItem:${itemId}`);
    // Clear items list cache (since item might have changed)
    this.clearByPattern('getItems:');
    // Clear item comments cache
    this.clearByPattern(`getItemComments:${itemId}`);
    // Clear stats cache (status might have changed)
    this.clearByPattern('getItemStats:');
  }

  /**
   * Invalidate all items-related cache
   */
  invalidateItems() {
    this.clearByPattern('getItems:');
    this.clearByPattern('getItem:');
    this.clearByPattern('getItemStats:');
  }

  /**
   * Invalidate notifications cache
   */
  invalidateNotifications() {
    this.clearByPattern('getNotifications:');
  }

  /**
   * Get cache statistics for debugging
   */
  getStats() {
    const now = Date.now();
    let expiredCount = 0;
    let activeCount = 0;

    for (const [key, expirationTime] of this.ttl.entries()) {
      if (now > expirationTime) {
        expiredCount++;
      } else {
        activeCount++;
      }
    }

    return {
      totalEntries: this.cache.size,
      activeEntries: activeCount,
      expiredEntries: expiredCount,
      hitRate: this.hitRate || 0
    };
  }
}

// Create and export a singleton instance
const cacheService = new CacheService();

// Add window method for debugging (only in development)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.cacheService = cacheService;
  window.logCacheStats = () => {
    console.log('Cache Statistics:', cacheService.getStats());
    console.log('Cache Contents:', [...cacheService.cache.keys()]);
  };
}

export default cacheService;
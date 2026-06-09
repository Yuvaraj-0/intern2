import redisClient from "../config/redis.js";

/**
 * Generic cache wrapper
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Function to fetch data if not cached
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<any>} Cached or fresh data
 */
export const getOrSetCache = async (key, fetchFn, ttl = 300) => {
  try {
    const cached = await redisClient.get(key);
    if (cached) {
      console.log(`✅ Cache hit: ${key}`);
      return JSON.parse(cached);
    }

    console.log(`❌ Cache miss: ${key}`);
    const freshData = await fetchFn();
    await redisClient.setEx(key, ttl, JSON.stringify(freshData));
    return freshData;
  } catch (error) {
    console.error("Cache error:", error);
    return fetchFn(); // Fallback to direct fetch
  }
};

/**
 * Delete cache by pattern
 * @param {string} pattern - Pattern to match keys
 */
export const deleteCachePattern = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`🗑️ Deleted ${keys.length} keys matching pattern: ${pattern}`);
    }
  } catch (error) {
    console.error("Delete cache pattern error:", error);
  }
};

/**
 * Clear all caches
 */
export const clearAllCaches = async () => {
  try {
    const keys = await redisClient.keys("cache:*");
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`🗑️ Cleared ${keys.length} cache keys`);
    }
  } catch (error) {
    console.error("Clear caches error:", error);
  }
};
import redisClient from "../config/redis.js";

const generateCacheKey = (req) => {
  const { originalUrl, query } = req;
  const queryString = JSON.stringify(query);
  return `cache:${originalUrl}:${queryString}`;
};

export const cache = (duration = 300) => {
  return async (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    const key = generateCacheKey(req);

    try {
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        console.log(`✅ Cache HIT: ${key}`);
        return res.json(JSON.parse(cachedData));
      }

      console.log(`❌ Cache MISS: ${key}`);

      const originalJson = res.json;
      res.json = function (data) {
        if (data.success !== false) {
          redisClient.setEx(key, duration, JSON.stringify(data)).catch(() => {});
        }
        originalJson.call(this, data);
      };
      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      next();
    }
  };
};
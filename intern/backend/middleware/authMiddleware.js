import { verifyAccessToken } from "../utils/tokenUtils.js";
import redisClient from "../config/redis.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    console.log("========== AUTH MIDDLEWARE ==========");
    console.log("Token received:", token ? `${token.substring(0, 50)}...` : "NO TOKEN");

    if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Check if token is blacklisted
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      console.log("❌ Token is blacklisted");
      return res.status(401).json({
        success: false,
        message: "Token has been revoked. Please login again.",
      });
    }

    const decoded = verifyAccessToken(token);
    console.log("✅ Token decoded:", decoded);
    console.log("📌 User ID:", decoded.userId);
    console.log("📌 Role from token:", decoded.role);

    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Auth Middleware Error:", error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export default authMiddleware;
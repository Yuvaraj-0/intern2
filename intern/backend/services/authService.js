import User from "../models/User.js";  // ← Add this import at the top
import bcrypt from "bcryptjs";
import redisClient from "../config/redis.js";
import { userRepository } from "../repositories/userRepository.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/tokenUtils.js";
import crypto from "crypto";

class AuthService {
  // Register user
  async register(userData) {
    const { name, email, password } = userData;

    // Check if user exists using repository
    const userExists = await userRepository.exists(email);
    if (userExists) {
      throw new Error("User already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user using repository
    const user = await userRepository.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

    // Store refresh token in Redis
    await redisClient.setEx(`refresh:${user.id}`, 7 * 24 * 60 * 60, refreshToken);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  // Login user
  async login(credentials, ip, userAgent) {
    const { email, password } = credentials;

    // Find user using User model directly (since we need password)
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    // Store refresh token in Redis
    await redisClient.setEx(`refresh:${user._id}`, 7 * 24 * 60 * 60, refreshToken);

    // Track session
    const sessionId = crypto.randomBytes(32).toString("hex");
    const sessionData = {
      sessionId,
      userId: user._id.toString(),
      userAgent,
      ip,
      loginAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    await redisClient.setEx(`session:${sessionId}`, 7 * 24 * 60 * 60, JSON.stringify(sessionData));
    await redisClient.sAdd(`user_sessions:${user._id}`, sessionId);
    await redisClient.expire(`user_sessions:${user._id}`, 7 * 24 * 60 * 60);

    return {
      accessToken,
      refreshToken,
      sessionId,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  // Get current user
  async getCurrentUser(userId) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      throw new Error("No refresh token provided");
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }

    const userId = decoded.userId;

    // Check if refresh token exists in Redis
    const storedToken = await redisClient.get(`refresh:${userId}`);
    if (!storedToken || storedToken !== refreshToken) {
      throw new Error("Refresh token not found");
    }

    // Get user role from database
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(userId, user.role);
    const newRefreshToken = generateRefreshToken(userId, user.role);
    await redisClient.setEx(`refresh:${userId}`, 7 * 24 * 60 * 60, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  // Logout user
  async logout(token, refreshToken, sessionId, userId) {
    // Blacklist access token
    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
        if (expiresIn > 0) {
          await redisClient.setEx(`blacklist:${token}`, expiresIn, "blacklisted");
        }
      } catch (err) {
        // Token might already be expired
      }
    }

    // Delete refresh token
    await redisClient.del(`refresh:${userId}`);

    // Remove session
    if (sessionId) {
      await redisClient.del(`session:${sessionId}`);
      await redisClient.sRem(`user_sessions:${userId}`, sessionId);
    } else {
      const sessions = await redisClient.sMembers(`user_sessions:${userId}`);
      for (const sessId of sessions) {
        await redisClient.del(`session:${sessId}`);
      }
      await redisClient.del(`user_sessions:${userId}`);
    }

    return true;
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword, currentToken) {
    if (!currentPassword || !newPassword) {
      throw new Error("Current password and new password are required");
    }

    if (newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters");
    }

    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new Error("Current password is incorrect");
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    // Blacklist current token
    if (currentToken) {
      try {
        const decoded = verifyAccessToken(currentToken);
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
        if (expiresIn > 0) {
          await redisClient.setEx(`blacklist:${currentToken}`, expiresIn, "blacklisted");
        }
      } catch (err) {
        // Token might already be expired
      }
    }

    // Delete all sessions
    await redisClient.del(`refresh:${userId}`);
    const sessions = await redisClient.sMembers(`user_sessions:${userId}`);
    for (const sessionId of sessions) {
      await redisClient.del(`session:${sessionId}`);
    }
    await redisClient.del(`user_sessions:${userId}`);

    return true;
  }

  // Update session last active
  async updateSessionActivity(sessionId) {
    const sessionData = await redisClient.get(`session:${sessionId}`);
    if (sessionData) {
      const session = JSON.parse(sessionData);
      session.lastActiveAt = new Date().toISOString();
      await redisClient.setEx(`session:${sessionId}`, 7 * 24 * 60 * 60, JSON.stringify(session));
    }
  }
}

export default new AuthService();
import User from "../models/User.js";

export const isAdmin = async (req, res, next) => {
  try {
    console.log("========== ROLE MIDDLEWARE ==========");
    console.log("User from token:", req.user);
    console.log("Role from token:", req.user?.role);

    // Get fresh user data from database
    const user = await User.findById(req.user.userId);
    
    console.log("User from database:", user?.email);
    console.log("Role from database:", user?.role);

    if (!user) {
      console.log("❌ User not found in database");
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      console.log("✅ Admin access granted");
      next();
    } else {
      console.log("❌ Access denied - User role is:", user.role);
      res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
        currentRole: user.role,  // Send current role in response for debugging
      });
    }
  } catch (error) {
    console.error("Role Middleware Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
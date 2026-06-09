import User from "../models/User.js";

export const userRepository = {
  // Find user by email
  async findByEmail(email) {
    return await User.findOne({ email });
  },

  // Find user by ID
  async findById(id) {
    return await User.findById(id).select("-password");
  },

  // Find user by ID with password (for password verification)
  async findByIdWithPassword(id) {
    return await User.findById(id).select("+password");
  },

  // Create new user
  async create(userData) {
    const user = await User.create(userData);
    // Return user without password
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  },

  // Update user
  async updateById(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");
  },

  // Update password
  async updatePassword(id, hashedPassword) {
    return await User.findByIdAndUpdate(id, { password: hashedPassword });
  },

  // Check if user exists
  async exists(email) {
    const count = await User.countDocuments({ email });
    return count > 0;
  },

  // Get user role
  async getUserRole(id) {
    const user = await User.findById(id).select("role");
    return user?.role;
  },
};
import express from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  refreshAccessToken,
  logoutUser,
  changePassword,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/logout", authMiddleware, logoutUser);
router.post("/change-password", authMiddleware, changePassword);
router.get("/me", authMiddleware, getCurrentUser);
// Debug route to check your role (remove after debugging)
router.get("/debug-role", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json({
      tokenRole: req.user.role,
      dbRole: user?.role,
      userId: req.user.userId,
      email: user?.email,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
export default router;
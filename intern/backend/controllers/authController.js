import authService from "../services/authService.js";

/*
========================
Register User
POST /api/auth/register
========================
*/
export const registerUser = async (req, res) => {
  try {
    console.log("Register Request:", req.body.email);

    const result = await authService.register(req.body);

    res.status(201).json({
      success: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/*
========================
Login User
POST /api/auth/login
========================
*/
export const loginUser = async (req, res) => {
  try {
    console.log("Login Request:", req.body.email);

    const result = await authService.login(
      req.body,
      req.ip || req.connection.remoteAddress,
      req.headers["user-agent"]
    );

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("sessionId", result.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

/*
========================
Get Current User Profile
GET /api/auth/me
========================
*/
export const getCurrentUser = async (req, res) => {
  try {
    const user = await authService.getCurrentUser(req.user.userId);

    // Update session activity
    const sessionId = req.cookies?.sessionId;
    if (sessionId) {
      await authService.updateSessionActivity(sessionId);
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
========================
Refresh Access Token
POST /api/auth/refresh
========================
*/
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    const result = await authService.refreshAccessToken(refreshToken);

    // Set new refresh token cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      accessToken: result.accessToken,
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

/*
========================
Logout User
POST /api/auth/logout
========================
*/
export const logoutUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const refreshToken = req.cookies.refreshToken;
    const sessionId = req.cookies.sessionId;
    const userId = req.user.userId;

    await authService.logout(token, refreshToken, sessionId, userId);

    res.clearCookie("refreshToken");
    res.clearCookie("sessionId");

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
========================
Change Password
POST /api/auth/change-password
========================
*/
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;
    const currentToken = req.headers.authorization?.split(" ")[1];

    await authService.changePassword(userId, currentPassword, newPassword, currentToken);

    res.clearCookie("refreshToken");
    res.clearCookie("sessionId");

    res.json({
      success: true,
      message: "Password changed successfully. Please login again.",
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
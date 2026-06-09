import api from "./api";

export const authService = {
  // Register
  async register(userData) {
    try {
      const response = await api.post("/auth/register", userData);
      if (response.data.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error("Register service error:", error);
      throw error;
    }
  },

  // Login
  async login(credentials) {
    try {
      const response = await api.post("/auth/login", credentials);
      if (response.data.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error("Login service error:", error);
      throw error;
    }
  },

  // Logout
  async logout() {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout service error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  },

  // Get current user from localStorage
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  },

  // Check if authenticated
  isAuthenticated() {
    return !!localStorage.getItem("accessToken");
  },

  // Get user role
  getUserRole() {
    const user = this.getCurrentUser();
    return user?.role || "user";
  },

  // Check if admin
  isAdmin() {
    return this.getUserRole() === "admin";
  },
};
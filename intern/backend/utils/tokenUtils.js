import jwt from "jsonwebtoken";

export const generateAccessToken = (userId, role = "user") => {
  console.log("Generating access token for userId:", userId, "with role:", role);
  return jwt.sign(
    { userId, role },  // ← Include role in token
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

export const generateRefreshToken = (userId, role = "user") => {
  console.log("Generating refresh token for userId:", userId, "with role:", role);
  return jwt.sign(
    { userId, role },  // ← Include role in token
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

export default generateAccessToken;
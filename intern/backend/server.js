import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from 'cookie-parser';

import connectDB from "./config/db.js";
import redisClient from "./config/redis.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();

/*
========================
Database Connection
========================
*/
await connectDB();
await redisClient.connect();

const app = express();
app.use(cookieParser());
/*
========================
Middlewares
========================
*/
app.use(express.json());

app.use(cors());

app.use(helmet());
await redisClient.set("test", "hello redis");

const value = await redisClient.get("test");

console.log("Redis Value:", value);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

/*
========================
Health Check Route
========================
*/
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Task Manager API Running",
  });
});


//auth route
app.use(
  "/api/auth",
  authRoutes
);
//prodduct route
app.use("/api", productRoutes);






/*
========================
Server
========================
*/
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
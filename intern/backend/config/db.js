import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("===== DB CONNECTION =====");
    console.log("URI Exists:", !!process.env.MONGODB_URI);
    console.log("URI Type:", typeof process.env.MONGODB_URI);

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB Connected");
    console.log("Host:", conn.connection.host);
    console.log("Database:", conn.connection.name);
    console.log("========================");
  } catch (error) {
    console.error("❌ Database Connection Failed");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
};

export default connectDB;
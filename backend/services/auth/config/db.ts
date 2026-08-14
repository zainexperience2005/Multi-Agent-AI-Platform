import mongoose from "mongoose";
import dns from "dns";

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("Please provide MongoDB URI");
  }
  try {
    // Set fallback DNS servers (Google and Cloudflare) to ensure c-ares resolves SRV records properly
    dns.setServers(["8.8.8.8", "1.1.1.1"]);

    const dbName = process.env.MONGODB_DB_NAME || "auth";
    await mongoose.connect(process.env.MONGODB_URI, { dbName });
    console.log(`MongoDB connected successfully to database: ${dbName}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;

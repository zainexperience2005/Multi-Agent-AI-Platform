import mongoose from "mongoose";
import dns from "dns";

/**
 * MongoDB Connection Handler
 * Connects the microservice to its MongoDB database. Override default DNS resolvers to guarantee SRV resolution stability.
 */
const connectDB = async () => {
  // Ensure the MongoDB URI string is configured
  if (!process.env.MONGODB_URI) {
    throw new Error("Please provide MongoDB URI");
  }
  try {
    // Set fallback DNS servers (Google and Cloudflare) to ensure Node's c-ares library resolves SRV records properly
    dns.setServers(["8.8.8.8", "1.1.1.1"]);

    const dbName = process.env.MONGODB_DB_NAME || "chat";
    // Connect to database using standard Mongoose client bindings
    await mongoose.connect(process.env.MONGODB_URI, { dbName });
    console.log(`MongoDB connected successfully to database: ${dbName}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Force termination if database cannot be reached
  }
};

export default connectDB;

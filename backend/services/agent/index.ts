import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db.ts";
import agentRoutes from "./routes/agent.routes.ts";

// Load environment variables from .env
dotenv.config();

const PORT = process.env.PORT || 8003;

const app: Express = express();

// Log requests to console
app.use(morgan("dev"));

// Enable CORS with cross-origin credentials support
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// Body parser and cookie parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API routes
app.use("/api/agent", agentRoutes);

// Base endpoint for health checking
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Agent Service!");
});

// Start listening on port and connect to MongoDB
app.listen(PORT, () => {
  connectDB();
  console.log(`Agent service is running on port ${PORT}`);
});

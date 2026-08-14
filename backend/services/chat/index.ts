import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db.ts";
import chatRoutes from "./routes/chat.routes.ts";

// Load environment variables from .env
dotenv.config();

const PORT = process.env.PORT || 8002;

const app: Express = express();

// Console logging for HTTP requests
app.use(morgan("dev"));

// Set up CORS policy supporting cookie credentials
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// Standard JSON body, URL encoding, and cookie parser middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Mount conversation and message routes under root path
app.use("/", chatRoutes);

// General health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Chat Service!");
});

// Start listening on port and connect to MongoDB
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Chat service is running on port ${PORT}`);
});

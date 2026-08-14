import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db.ts";
import authRoutes from "./routes/auth.route.ts";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 8001;

const app: Express = express();

app.use(morgan("dev"));
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/", authRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Auth Service!");
});

// Start listening on port
app.listen(PORT, () => {
  connectDB();
  console.log(`Auth service is running on port ${PORT}`);
});

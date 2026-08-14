import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db.ts";
import chatRoutes from "./routes/chat.routes.ts";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 8002;

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

app.use("/", chatRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Chat Service!");
});

// Start listening on port
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Chat service is running on port ${PORT}`);
});

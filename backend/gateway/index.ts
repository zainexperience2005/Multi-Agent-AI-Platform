import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";
import proxy from "express-http-proxy";
import proxyWithHeader from "./utils/proxy-with-header.ts";
import protect from "./middleware/auth.middleware.ts";
import getCurrentUser from "./controllers/user.controller.ts";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 8000;

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
app.get("/api/me", protect, getCurrentUser);
app.use(
  "/api/auth",
  proxy(`${process.env.AUTH_PORT}`, {
    proxyReqPathResolver: (req: Request) => {
      return req.url;
    },
  }),
);

app.use(
  "/api/chat",
  protect,
  proxyWithHeader(`${process.env.CHAT_PORT}`),
);

app.use(
  "/api/agent",
  proxy(`${process.env.AGENT_PORT}`, {
    proxyReqPathResolver: (req: Request) => {
      return req.url;
    },
  }),
);

app.use(
  "/api/billing",
  proxy(`${process.env.BILLING_PORT}`, {
    proxyReqPathResolver: (req: Request) => {
      return req.url;
    },
  }),
);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Start listening on port
app.listen(PORT, () => {
  console.log(`Gateway server is running on port ${PORT}`);
});

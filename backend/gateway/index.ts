import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";
import proxy from "express-http-proxy";
import proxyWithHeader from "./utils/proxy-with-header.ts";
import protect from "./middleware/auth.middleware.ts";
import getCurrentUser from "./controllers/user.controller.ts";

// Load environment variables from .env
dotenv.config();

const PORT = process.env.PORT || 8000;

const app: Express = express();

// HTTP Request logging middleware
app.use(morgan("dev"));

// Setup Cross-Origin Resource Sharing (CORS) with support for credentials/cookies
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// Standard parsers for JSON payloads, URL encoded payloads, and HTTP cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/**
 * Route: GET /api/me
 * Description: Fetches details of the currently authenticated user session.
 * Middleware: 'protect' verifies the session via Redis.
 */
app.get("/api/me", protect, getCurrentUser);

/**
 * Route: /api/auth
 * Description: Proxies authentication requests directly to the Auth Microservice.
 * Path Resolving: Forwards the relative suffix path (e.g. /login, /logout).
 */
app.use(
  "/api/auth",
  proxy(`${process.env.AUTH_PORT}`, {
    proxyReqPathResolver: (req: Request) => {
      return req.url;
    },
  }),
);

/**
 * Route: /api/chat
 * Description: Proxies chat-related requests to the Chat Microservice.
 * Middleware: 'protect' secures it; 'proxyWithHeader' automatically appends 'X-USER-ID' from the Redis session context.
 */
app.use(
  "/api/chat",
  protect,
  proxyWithHeader(`${process.env.CHAT_PORT}`),
);

/**
 * Route: /api/agent
 * Description: Proxies agent workspace queries to the Agent Microservice.
 */
app.use(
  "/api/agent",
  proxy(`${process.env.AGENT_PORT}`, {
    proxyReqPathResolver: (req: Request) => {
      return req.url;
    },
  }),
);

/**
 * Route: /api/billing
 * Description: Proxies subscription and ledger calls to the Billing Microservice.
 */
app.use(
  "/api/billing",
  proxy(`${process.env.BILLING_PORT}`, {
    proxyReqPathResolver: (req: Request) => {
      return req.url;
    },
  }),
);

// Health check endpoint for the gateway itself
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Start listening on the designated API Gateway port
app.listen(PORT, () => {
  console.log(`Gateway server is running on port ${PORT}`);
});

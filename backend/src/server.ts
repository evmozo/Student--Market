import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import http from "http";
import morgan from "morgan";
import { Server } from "socket.io";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middleware/error";
import { apiRoutes } from "./routes";
import { seedDemoData } from "./services/demoSeed";
import { registerSocketServer } from "./socket";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.clientUrl,
    credentials: true
  }
});

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.use("/api", apiRoutes);
app.use(notFound);
app.use(errorHandler);

registerSocketServer(io);

const start = async (): Promise<void> => {
  await connectDB();
  if (env.seedDemoData) {
    await seedDemoData();
  }
  server.listen(env.port, () => {
    console.log(`Backend running on http://localhost:${env.port}`);
  });
};

start().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

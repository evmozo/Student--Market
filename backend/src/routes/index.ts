import { Router } from "express";
import { adminRoutes } from "./adminRoutes";
import { authRoutes } from "./authRoutes";
import { friendRoutes } from "./friendRoutes";
import { messageRoutes } from "./messageRoutes";
import { notificationRoutes } from "./notificationRoutes";
import { postRoutes } from "./postRoutes";
import { uploadRoutes } from "./uploadRoutes";
import { userRoutes } from "./userRoutes";
import { verificationRoutes } from "./verificationRoutes";

export const apiRoutes = Router();

apiRoutes.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", timestamp: new Date().toISOString() } });
});

apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/users", userRoutes);
apiRoutes.use("/friends", friendRoutes);
apiRoutes.use("/posts", postRoutes);
apiRoutes.use("/messages", messageRoutes);
apiRoutes.use("/verification", verificationRoutes);
apiRoutes.use("/notifications", notificationRoutes);
apiRoutes.use("/uploads", uploadRoutes);
apiRoutes.use("/admin", adminRoutes);

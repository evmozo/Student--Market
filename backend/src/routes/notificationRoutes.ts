import { Router } from "express";
import { param } from "express-validator";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "../controllers/notificationController";
import { authenticate } from "../middleware/auth";
import { validate } from "../utils/validation";

export const notificationRoutes = Router();

notificationRoutes.use(authenticate);
notificationRoutes.get("/", listNotifications);
notificationRoutes.patch("/read-all", markAllNotificationsRead);
notificationRoutes.patch("/:id/read", [param("id").isMongoId()], validate, markNotificationRead);

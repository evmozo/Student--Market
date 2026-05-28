import { Router } from "express";
import { body, param } from "express-validator";
import {
  approveVerification,
  rejectVerification,
  submitVerification,
  verificationQueue
} from "../controllers/verificationController";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { validate } from "../utils/validation";

export const verificationRoutes = Router();

verificationRoutes.post(
  "/submit",
  authenticate,
  [body("verificationDocument").isURL()],
  validate,
  submitVerification
);
verificationRoutes.get("/queue", authenticate, requireRole("admin"), verificationQueue);
verificationRoutes.patch("/:id/approve", authenticate, requireRole("admin"), [param("id").isMongoId()], validate, approveVerification);
verificationRoutes.patch(
  "/:id/reject",
  authenticate,
  requireRole("admin"),
  [param("id").isMongoId(), body("reason").trim().isLength({ min: 3, max: 500 })],
  validate,
  rejectVerification
);

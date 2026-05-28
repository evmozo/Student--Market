import { Router } from "express";
import { body } from "express-validator";
import { uploadMedia } from "../controllers/uploadController";
import { authenticate } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { validate } from "../utils/validation";

export const uploadRoutes = Router();

uploadRoutes.post(
  "/single",
  authenticate,
  upload.single("file"),
  [body("folder").optional().trim().isLength({ min: 2, max: 80 })],
  validate,
  uploadMedia
);

uploadRoutes.post(
  "/multiple",
  authenticate,
  upload.array("files", 5),
  [body("folder").optional().trim().isLength({ min: 2, max: 80 })],
  validate,
  uploadMedia
);

import multer from "multer";
import { AppError } from "../utils/http";

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
  "audio/webm",
  "audio/mpeg",
  "application/pdf"
]);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      callback(new AppError("Unsupported file type", 415));
      return;
    }
    callback(null, true);
  }
});

import type { Request, Response } from "express";
import { AppError, asyncHandler, sendSuccess } from "../utils/http";
import { uploadBufferToSupabase } from "../services/supabase";

export const uploadMedia = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;
  const file = req.file;
  const folder = typeof req.body.folder === "string" ? req.body.folder : "uploads";

  if (!file && (!files || files.length === 0)) {
    throw new AppError("At least one file is required", 422);
  }

  if (files?.length) {
    const urls = await Promise.all(files.map((item) => uploadBufferToSupabase(item, folder)));
    sendSuccess(res, { urls }, 201);
    return;
  }

  if (!file) {
    throw new AppError("File upload failed", 422);
  }
  const url = await uploadBufferToSupabase(file, folder);
  sendSuccess(res, { url }, 201);
});

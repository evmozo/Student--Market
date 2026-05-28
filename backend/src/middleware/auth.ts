import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import { User } from "../models/User";
import { AppError } from "../utils/http";

export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload & { id?: string };
    if (!payload.id) {
      throw new AppError("Invalid token", 401);
    }

    const user = await User.findById(payload.id);
    if (!user) {
      throw new AppError("User no longer exists", 401);
    }
    if (user.accountStatus !== "active") {
      throw new AppError(`Account is ${user.accountStatus}`, 403);
    }

    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });
    req.user = user;
    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError("Invalid or expired token", 401));
  }
};

export const requireVerifiedStudent = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(new AppError("Authentication required", 401));
    return;
  }
  if (req.user.verificationStatus !== "verified") {
    next(new AppError("Only verified students can perform this action", 403));
    return;
  }
  next();
};

import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  adminDeletePost,
  adminListPosts,
  adminListUsers,
  adminUpdatePost,
  adminUpdateUser,
  stats
} from "../controllers/adminController";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { validate } from "../utils/validation";

export const adminRoutes = Router();

adminRoutes.use(authenticate, requireRole("admin"));
adminRoutes.get("/stats", stats);
adminRoutes.get(
  "/users",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("q").optional().trim().isLength({ max: 100 }),
    query("verificationStatus").optional().isIn(["unverified", "pending", "verified", "rejected"]),
    query("accountStatus").optional().isIn(["active", "suspended", "banned"])
  ],
  validate,
  adminListUsers
);
adminRoutes.patch(
  "/users/:id",
  [
    param("id").isMongoId(),
    body("accountStatus").optional().isIn(["active", "suspended", "banned"]),
    body("role").optional().isIn(["student", "admin"])
  ],
  validate,
  adminUpdateUser
);
adminRoutes.get(
  "/posts",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("q").optional().trim().isLength({ max: 100 }),
    query("status").optional().isIn(["active", "sold", "archived"])
  ],
  validate,
  adminListPosts
);
adminRoutes.patch(
  "/posts/:id",
  [param("id").isMongoId(), body("status").isIn(["active", "sold", "archived"])],
  validate,
  adminUpdatePost
);
adminRoutes.delete("/posts/:id", [param("id").isMongoId()], validate, adminDeletePost);

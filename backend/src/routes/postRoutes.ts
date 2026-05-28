import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  addComment,
  createPost,
  deletePost,
  getPost,
  listPosts,
  listUserPosts,
  sharePost,
  toggleReaction,
  updatePostStatus
} from "../controllers/postController";
import { authenticate, requireVerifiedStudent } from "../middleware/auth";
import { validate } from "../utils/validation";

export const postRoutes = Router();

postRoutes.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 30 }),
    query("category").optional().isIn(["all", "books", "electronics", "clothing", "school-supplies", "furniture", "services", "other"]),
    query("type").optional().isIn(["all", "buy", "sell"]),
    query("sort").optional().isIn(["newest", "oldest", "price-asc", "price-desc", "popular"]),
    query("search").optional().trim().isLength({ max: 100 })
  ],
  validate,
  listPosts
);

postRoutes.get("/user/:id", [param("id").isMongoId()], validate, listUserPosts);
postRoutes.get("/:id", [param("id").isMongoId()], validate, getPost);

postRoutes.post(
  "/",
  authenticate,
  requireVerifiedStudent,
  [
    body("title").trim().isLength({ min: 3, max: 100 }),
    body("description").trim().isLength({ min: 5, max: 2000 }),
    body("price").isFloat({ min: 0 }),
    body("category").isIn(["books", "electronics", "clothing", "school-supplies", "furniture", "services", "other"]),
    body("type").isIn(["buy", "sell"]),
    body("images").isArray({ max: 5 }),
    body("images.*").optional().isURL(),
    body("condition").isIn(["brand-new", "like-new", "used-good", "used-fair"]),
    body("location").trim().isLength({ min: 2, max: 120 })
  ],
  validate,
  createPost
);

postRoutes.patch(
  "/:id/status",
  authenticate,
  [param("id").isMongoId(), body("status").isIn(["active", "sold", "archived"])],
  validate,
  updatePostStatus
);
postRoutes.delete("/:id", authenticate, [param("id").isMongoId()], validate, deletePost);
postRoutes.post(
  "/:id/reactions",
  authenticate,
  [param("id").isMongoId(), body("type").isIn(["like", "love", "wow", "interested"])],
  validate,
  toggleReaction
);
postRoutes.post(
  "/:id/comments",
  authenticate,
  [param("id").isMongoId(), body("text").trim().isLength({ min: 1, max: 500 })],
  validate,
  addComment
);
postRoutes.post("/:id/share", [param("id").isMongoId()], validate, sharePost);

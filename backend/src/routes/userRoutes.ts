import { Router } from "express";
import { body, param, query } from "express-validator";
import { friendSuggestions, getProfile, searchUsers, updateProfile } from "../controllers/userController";
import { authenticate } from "../middleware/auth";
import { validate } from "../utils/validation";

export const userRoutes = Router();

userRoutes.get(
  "/",
  authenticate,
  [query("q").optional().trim().isLength({ max: 80 }), query("verifiedOnly").optional().isBoolean()],
  validate,
  searchUsers
);

userRoutes.get("/suggestions/friends", authenticate, friendSuggestions);

userRoutes.get("/:id", [param("id").isMongoId()], validate, getProfile);

userRoutes.patch(
  "/me",
  authenticate,
  [
    body("name").optional().trim().isLength({ min: 2, max: 80 }),
    body("bio").optional().trim().isLength({ max: 150 }),
    body("school").optional().trim().isLength({ max: 120 }),
    body("course").optional().trim().isLength({ max: 120 }),
    body("profilePicture").optional({ nullable: true }).isURL(),
    body("coverPhoto").optional({ nullable: true }).isURL()
  ],
  validate,
  updateProfile
);

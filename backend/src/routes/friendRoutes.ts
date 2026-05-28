import { Router } from "express";
import { body, param } from "express-validator";
import {
  listFriends,
  listFriendRequests,
  respondToFriendRequest,
  sendFriendRequest,
  unfriend
} from "../controllers/friendController";
import { authenticate } from "../middleware/auth";
import { validate } from "../utils/validation";

export const friendRoutes = Router();

friendRoutes.use(authenticate);
friendRoutes.get("/", listFriends);
friendRoutes.get("/requests", listFriendRequests);
friendRoutes.post("/:id/request", [param("id").isMongoId()], validate, sendFriendRequest);
friendRoutes.patch(
  "/:id/respond",
  [param("id").isMongoId(), body("status").isIn(["accepted", "rejected"])],
  validate,
  respondToFriendRequest
);
friendRoutes.delete("/:id", [param("id").isMongoId()], validate, unfriend);

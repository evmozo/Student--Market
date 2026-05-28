import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  getConversation,
  getMessages,
  listConversations,
  markRead,
  reactToMessage,
  removeMessageForMe,
  sendMessage,
  unsendMessage
} from "../controllers/messageController";
import { authenticate } from "../middleware/auth";
import { validate } from "../utils/validation";

export const messageRoutes = Router();

messageRoutes.use(authenticate);
messageRoutes.get("/", [query("q").optional().trim().isLength({ max: 80 })], validate, listConversations);
messageRoutes.post(
  "/",
  [
    body("recipientId").isMongoId(),
    body("text").optional().trim().isLength({ max: 4000 }),
    body("mediaUrl").optional().isURL(),
    body("mediaType").optional({ nullable: true }).isIn(["image", "video", "voice", null]),
    body("voiceDuration").optional().isFloat({ min: 0 }),
    body("replyTo").optional().isMongoId()
  ],
  validate,
  sendMessage
);
messageRoutes.get("/:conversationId", [param("conversationId").isString().notEmpty()], validate, getConversation);
messageRoutes.get(
  "/:conversationId/messages",
  [
    param("conversationId").isString().notEmpty(),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 50 })
  ],
  validate,
  getMessages
);
messageRoutes.post("/:conversationId/read", [param("conversationId").isString().notEmpty()], validate, markRead);
messageRoutes.patch(
  "/:conversationId/messages/:messageId/unsend",
  [param("conversationId").isString().notEmpty(), param("messageId").isMongoId()],
  validate,
  unsendMessage
);
messageRoutes.patch(
  "/:conversationId/messages/:messageId/remove",
  [param("conversationId").isString().notEmpty(), param("messageId").isMongoId()],
  validate,
  removeMessageForMe
);
messageRoutes.post(
  "/:conversationId/messages/:messageId/reactions",
  [param("conversationId").isString().notEmpty(), param("messageId").isMongoId(), body("emoji").isString().isLength({ min: 1, max: 8 })],
  validate,
  reactToMessage
);

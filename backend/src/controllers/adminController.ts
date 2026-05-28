import type { Request, Response } from "express";
import { Message } from "../models/Message";
import { Post } from "../models/Post";
import { User } from "../models/User";
import { AppError, asyncHandler, sendSuccess } from "../utils/http";
import { serializeUser } from "../utils/serializers";

export const stats = asyncHandler(async (_req: Request, res: Response) => {
  const [totalUsers, verified, pending, posts, messages] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ verificationStatus: "verified" }),
    User.countDocuments({ verificationStatus: "pending" }),
    Post.countDocuments(),
    Message.aggregate([{ $project: { count: { $size: "$messages" } } }, { $group: { _id: null, total: { $sum: "$count" } } }])
  ]);
  sendSuccess(res, {
    totalUsers,
    verified,
    pending,
    posts,
    messages: messages[0]?.total ?? 0
  });
});

export const adminListUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit ?? 20), 1), 100);
  const filters: Record<string, unknown> = {};
  if (req.query.q) {
    filters.$or = [
      { name: { $regex: req.query.q, $options: "i" } },
      { email: { $regex: req.query.q, $options: "i" } }
    ];
  }
  if (req.query.verificationStatus) filters.verificationStatus = req.query.verificationStatus;
  if (req.query.accountStatus) filters.accountStatus = req.query.accountStatus;

  const [users, total] = await Promise.all([
    User.find(filters).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filters)
  ]);
  sendSuccess(res, { users: users.map(serializeUser), page, total, hasMore: page * limit < total });
});

export const adminUpdateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  const { accountStatus, role } = req.body as {
    accountStatus?: "active" | "suspended" | "banned";
    role?: "student" | "admin";
  };
  if (accountStatus) user.accountStatus = accountStatus;
  if (role) user.role = role;
  await user.save();
  sendSuccess(res, { user: serializeUser(user) });
});

export const adminListPosts = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit ?? 20), 1), 100);
  const filters: Record<string, unknown> = {};
  if (req.query.q) {
    filters.$or = [
      { title: { $regex: req.query.q, $options: "i" } },
      { description: { $regex: req.query.q, $options: "i" } }
    ];
  }
  if (req.query.status) filters.status = req.query.status;

  const [posts, total] = await Promise.all([
    Post.find(filters)
      .populate("author", "name email profilePicture school verificationStatus")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Post.countDocuments(filters)
  ]);
  sendSuccess(res, { posts, page, total, hasMore: page * limit < total });
});

export const adminUpdatePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  post.status = req.body.status;
  await post.save();
  sendSuccess(res, { post });
});

export const adminDeletePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  sendSuccess(res, { message: "Post deleted" });
});

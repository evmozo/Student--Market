import type { Request, Response } from "express";
import { Types } from "mongoose";
import { Post, type ReactionType } from "../models/Post";
import { createNotification } from "../services/notifications";
import { AppError, asyncHandler, sendSuccess } from "../utils/http";

const sortMap = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  popular: { views: -1, shares: -1 }
} as const;

const postPopulate = [
  { path: "author", select: "name profilePicture school verificationStatus" },
  { path: "comments.user", select: "name profilePicture school verificationStatus" },
  { path: "reactions.user", select: "name profilePicture school verificationStatus" }
];

export const listPosts = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit ?? 12), 1), 30);
  const sortKey = String(req.query.sort ?? "newest") as keyof typeof sortMap;
  const filters: Record<string, unknown> = { status: { $ne: "archived" } };

  if (req.query.category && req.query.category !== "all") filters.category = req.query.category;
  if (req.query.type && req.query.type !== "all") filters.type = req.query.type;
  if (req.query.search) filters.$text = { $search: String(req.query.search) };

  const [posts, total] = await Promise.all([
    Post.find(filters)
      .populate(postPopulate)
      .sort(sortMap[sortKey] ?? sortMap.newest)
      .skip((page - 1) * limit)
      .limit(limit),
    Post.countDocuments(filters)
  ]);

  sendSuccess(res, { posts, page, hasMore: page * limit < total, total });
});

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  const post = await Post.create({
    ...req.body,
    author: req.user._id
  });
  const populated = await post.populate(postPopulate);
  sendSuccess(res, { post: populated }, 201);
});

export const getPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
    .populate(postPopulate);
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  sendSuccess(res, { post });
});

export const updatePostStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  const isOwner = post.author.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    throw new AppError("Only the owner or admin can update this post", 403);
  }
  post.status = req.body.status;
  await post.save();
  const populated = await post.populate(postPopulate);
  sendSuccess(res, { post: populated });
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  const isOwner = post.author.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    throw new AppError("Only the owner or admin can delete this post", 403);
  }
  await post.deleteOne();
  sendSuccess(res, { message: "Post deleted" });
});

export const toggleReaction = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  const { type } = req.body as { type: ReactionType };
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new AppError("Post not found", 404);
  }

  const existingIndex = post.reactions.findIndex((reaction) => reaction.user.toString() === req.user?._id.toString());
  if (existingIndex >= 0 && post.reactions[existingIndex].type === type) {
    post.reactions.splice(existingIndex, 1);
  } else if (existingIndex >= 0) {
    post.reactions[existingIndex].type = type;
  } else {
    post.reactions.push({ user: req.user._id, type });
    if (post.author.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: post.author,
        sender: req.user._id,
        type: "post-reaction",
        message: `${req.user.name} reacted to your post`,
        relatedPost: post._id
      });
    }
  }

  await post.save();
  const populated = await post.populate(postPopulate);
  sendSuccess(res, { post: populated });
});

export const addComment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  post.comments.push({ user: req.user._id, text: req.body.text, createdAt: new Date() });
  await post.save();

  if (post.author.toString() !== req.user._id.toString()) {
    await createNotification({
      recipient: post.author,
      sender: req.user._id,
      type: "post-comment",
      message: `${req.user.name} commented on your post`,
      relatedPost: post._id
    });
  }

  const populated = await post.populate(postPopulate);
  sendSuccess(res, { post: populated });
});

export const sharePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { shares: 1 } }, { new: true }).populate(postPopulate);
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  sendSuccess(res, { post });
});

export const listUserPosts = asyncHandler(async (req: Request, res: Response) => {
  const authorId = new Types.ObjectId(req.params.id);
  const posts = await Post.find({ author: authorId, status: { $ne: "archived" } })
    .populate(postPopulate)
    .sort({ createdAt: -1 });
  sendSuccess(res, { posts });
});

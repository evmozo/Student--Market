import type { Request, Response } from "express";
import { Types } from "mongoose";
import { Post } from "../models/Post";
import { User } from "../models/User";
import { AppError, asyncHandler, sendSuccess } from "../utils/http";
import { serializeUser } from "../utils/serializers";

export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const q = String(req.query.q ?? "").trim();
  const verifiedOnly = req.query.verifiedOnly === "true";
  const filters: Record<string, unknown> = { accountStatus: "active" };
  if (q) {
    filters.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { school: { $regex: q, $options: "i" } }
    ];
  }
  if (verifiedOnly) {
    filters.verificationStatus = "verified";
  }

  const users = await User.find(filters).limit(20).sort({ name: 1 });
  sendSuccess(res, { users: users.map(serializeUser) });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).populate(
    "friends",
    "name email profilePicture coverPhoto bio school course verificationStatus friendRequests friends lastSeen accountStatus createdAt updatedAt"
  );
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const friends = user.friends
    .filter((friend) => typeof friend === "object" && "_id" in friend)
    .map((friend) => serializeUser(friend as never));
  const postCount = await Post.countDocuments({ author: user._id, status: { $ne: "archived" } });
  sendSuccess(res, { user: serializeUser(user), friends, postCount, friendCount: user.friends.length });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  const { name, bio, school, course, profilePicture, coverPhoto } = req.body as {
    name?: string;
    bio?: string;
    school?: string;
    course?: string;
    profilePicture?: string;
    coverPhoto?: string;
  };

  if (name !== undefined) req.user.name = name;
  if (bio !== undefined) req.user.bio = bio;
  if (school !== undefined) req.user.school = school;
  if (course !== undefined) req.user.course = course;
  if (profilePicture !== undefined) req.user.profilePicture = profilePicture;
  if (coverPhoto !== undefined) req.user.coverPhoto = coverPhoto;
  await req.user.save();

  sendSuccess(res, { user: serializeUser(req.user) });
});

export const friendSuggestions = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const friendIds = req.user.friends.map((id) => id.toString());
  const excluded = [req.user._id.toString(), ...friendIds].map((id) => new Types.ObjectId(id));
  const affinityFilters = [req.user.school ? { school: req.user.school } : undefined, req.user.course ? { course: req.user.course } : undefined].filter(
    Boolean
  );
  const filters: Record<string, unknown> = {
    _id: { $nin: excluded },
    accountStatus: "active"
  };
  if (affinityFilters.length > 0) {
    filters.$or = affinityFilters;
  }

  const users = await User.find(filters)
    .limit(12)
    .sort({ createdAt: -1 });

  sendSuccess(res, { users: users.map(serializeUser) });
});

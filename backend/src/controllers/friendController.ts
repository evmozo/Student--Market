import type { Request, Response } from "express";
import { Types } from "mongoose";
import { User } from "../models/User";
import { createNotification } from "../services/notifications";
import { AppError, asyncHandler, sendSuccess } from "../utils/http";
import { serializeUser } from "../utils/serializers";

const requireCurrentUser = (req: Request) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  return req.user;
};

export const sendFriendRequest = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = requireCurrentUser(req);
  const targetId = req.params.id;
  if (currentUser._id.toString() === targetId) {
    throw new AppError("You cannot add yourself", 400);
  }

  const target = await User.findById(targetId);
  if (!target || target.accountStatus !== "active") {
    throw new AppError("User not found", 404);
  }
  if (currentUser.friends.some((id) => id.toString() === targetId)) {
    throw new AppError("You are already friends", 409);
  }
  if (target.friendRequests.some((request) => request.from.toString() === currentUser._id.toString() && request.status === "pending")) {
    throw new AppError("Friend request already sent", 409);
  }

  target.friendRequests.push({ from: currentUser._id, status: "pending", createdAt: new Date() });
  await target.save();
  await createNotification({
    recipient: target._id,
    sender: currentUser._id,
    type: "friend-request",
    message: `${currentUser.name} sent you a friend request`
  });

  sendSuccess(res, { message: "Friend request sent" }, 201);
});

export const listFriends = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = requireCurrentUser(req);
  const user = await User.findById(currentUser._id).populate(
    "friends",
    "name email profilePicture coverPhoto bio school course verificationStatus friendRequests friends lastSeen accountStatus createdAt updatedAt"
  );
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const friends = user.friends
    .filter((friend) => typeof friend === "object" && "_id" in friend)
    .map((friend) => serializeUser(friend as never));

  sendSuccess(res, { friends });
});

export const listFriendRequests = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = requireCurrentUser(req);
  const user = await User.findById(currentUser._id).populate("friendRequests.from", "name profilePicture school verificationStatus");
  if (!user) {
    throw new AppError("User not found", 404);
  }
  sendSuccess(res, { requests: user.friendRequests.filter((request) => request.status === "pending") });
});

export const respondToFriendRequest = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = requireCurrentUser(req);
  const { status } = req.body as { status: "accepted" | "rejected" };
  const fromId = req.params.id;
  const request = currentUser.friendRequests.find(
    (item) => item.from.toString() === fromId && item.status === "pending"
  );
  if (!request) {
    throw new AppError("Pending friend request not found", 404);
  }

  request.status = status;
  if (status === "accepted") {
    const fromUser = await User.findById(fromId);
    if (!fromUser) {
      throw new AppError("Requester not found", 404);
    }
    if (!currentUser.friends.some((id) => id.toString() === fromId)) {
      currentUser.friends.push(new Types.ObjectId(fromId));
    }
    if (!fromUser.friends.some((id) => id.toString() === currentUser._id.toString())) {
      fromUser.friends.push(currentUser._id);
    }
    await fromUser.save();
    await createNotification({
      recipient: fromUser._id,
      sender: currentUser._id,
      type: "friend-accepted",
      message: `${currentUser.name} accepted your friend request`
    });
  }

  await currentUser.save();
  sendSuccess(res, { user: serializeUser(currentUser) });
});

export const unfriend = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = requireCurrentUser(req);
  const friendId = req.params.id;
  const friend = await User.findById(friendId);
  if (!friend) {
    throw new AppError("User not found", 404);
  }

  currentUser.friends = currentUser.friends.filter((id) => id.toString() !== friendId);
  friend.friends = friend.friends.filter((id) => id.toString() !== currentUser._id.toString());
  await Promise.all([currentUser.save(), friend.save()]);
  sendSuccess(res, { user: serializeUser(currentUser) });
});

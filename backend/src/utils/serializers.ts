import type { HydratedDocument, Types } from "mongoose";
import type { IUser } from "../models/User";

const idString = (value: Types.ObjectId | string | { _id?: Types.ObjectId; id?: string }): string => {
  if (typeof value === "string") return value;
  if ("id" in value && typeof value.id === "string") return value.id;
  if ("_id" in value && value._id) return value._id.toString();
  return value.toString();
};

export const serializeUser = (user: HydratedDocument<IUser> | IUser) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  profilePicture: user.profilePicture,
  coverPhoto: user.coverPhoto,
  bio: user.bio,
  school: user.school,
  course: user.course,
  verificationStatus: user.verificationStatus,
  verificationDocument: user.verificationDocument,
  verificationSubmittedAt: user.verificationSubmittedAt,
  verificationReviewedAt: user.verificationReviewedAt,
  verificationRejectionReason: user.verificationRejectionReason,
  friends: user.friends.map((friend) => idString(friend)),
  friendRequests: user.friendRequests.map((request) => ({
    from: request.from.toString(),
    status: request.status,
    createdAt: request.createdAt
  })),
  lastSeen: user.lastSeen,
  accountStatus: user.accountStatus,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

export const toObjectIdString = (value: Types.ObjectId | string): string => value.toString();

import bcrypt from "bcryptjs";
import mongoose, { type Document, Schema, type Types } from "mongoose";

export type UserRole = "student" | "admin";
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";
export type AccountStatus = "active" | "suspended" | "banned";
export type FriendRequestStatus = "pending" | "accepted" | "rejected";

export interface IFriendRequest {
  from: Types.ObjectId;
  status: FriendRequestStatus;
  createdAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  profilePicture?: string;
  coverPhoto?: string;
  bio?: string;
  school?: string;
  course?: string;
  verificationStatus: VerificationStatus;
  verificationDocument?: string;
  verificationSubmittedAt?: Date;
  verificationReviewedAt?: Date;
  verificationRejectionReason?: string;
  friends: Types.ObjectId[];
  friendRequests: IFriendRequest[];
  lastSeen?: Date;
  accountStatus: AccountStatus;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const friendRequestSchema = new Schema<IFriendRequest>(
  {
    from: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending"
    },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    profilePicture: { type: String },
    coverPhoto: { type: String },
    bio: { type: String, maxlength: 150, default: "" },
    school: { type: String, trim: true, maxlength: 120 },
    course: { type: String, trim: true, maxlength: 120 },
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified"
    },
    verificationDocument: { type: String },
    verificationSubmittedAt: { type: Date },
    verificationReviewedAt: { type: Date },
    verificationRejectionReason: { type: String, maxlength: 500 },
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    friendRequests: [friendRequestSchema],
    lastSeen: { type: Date, default: Date.now },
    accountStatus: { type: String, enum: ["active", "suspended", "banned"], default: "active" },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false }
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    next();
    return;
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.index({ school: 1, course: 1, verificationStatus: 1 });

export const User = mongoose.model<IUser>("User", userSchema);

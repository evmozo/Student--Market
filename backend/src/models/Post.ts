import mongoose, { type Document, Schema, type Types } from "mongoose";

export type PostCategory =
  | "books"
  | "electronics"
  | "clothing"
  | "school-supplies"
  | "furniture"
  | "services"
  | "other";
export type PostType = "buy" | "sell";
export type PostCondition = "brand-new" | "like-new" | "used-good" | "used-fair";
export type PostStatus = "active" | "sold" | "archived";
export type ReactionType = "like" | "love" | "wow" | "interested";

export interface IPostReaction {
  user: Types.ObjectId;
  type: ReactionType;
}

export interface IPostComment {
  user: Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface IPost extends Document {
  author: Types.ObjectId;
  title: string;
  description: string;
  price: number;
  category: PostCategory;
  type: PostType;
  images: string[];
  condition: PostCondition;
  location: string;
  status: PostStatus;
  reactions: IPostReaction[];
  comments: IPostComment[];
  shares: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const reactionSchema = new Schema<IPostReaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["like", "love", "wow", "interested"], required: true }
  },
  { _id: false }
);

const commentSchema = new Schema<IPostComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const postSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ["books", "electronics", "clothing", "school-supplies", "furniture", "services", "other"],
      required: true,
      index: true
    },
    type: { type: String, enum: ["buy", "sell"], required: true, index: true },
    images: {
      type: [String],
      validate: {
        validator: (images: string[]) => images.length <= 5,
        message: "Posts can have at most 5 images"
      },
      default: []
    },
    condition: {
      type: String,
      enum: ["brand-new", "like-new", "used-good", "used-fair"],
      required: true
    },
    location: { type: String, required: true, trim: true, maxlength: 120 },
    status: { type: String, enum: ["active", "sold", "archived"], default: "active", index: true },
    reactions: [reactionSchema],
    comments: [commentSchema],
    shares: { type: Number, default: 0, min: 0 },
    views: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

postSchema.index({ title: "text", description: "text" });
postSchema.index({ createdAt: -1 });
postSchema.index({ price: 1 });

export const Post = mongoose.model<IPost>("Post", postSchema);

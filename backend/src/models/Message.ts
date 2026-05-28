import mongoose, { type Document, Schema, type Types } from "mongoose";

export type MediaType = "image" | "video" | "voice" | null;

export interface IMessageReaction {
  user: Types.ObjectId;
  emoji: string;
}

export interface IMessageItem {
  _id: Types.ObjectId;
  sender: Types.ObjectId;
  text?: string;
  mediaUrl?: string;
  mediaType: MediaType;
  voiceDuration?: number;
  replyTo?: Types.ObjectId;
  isUnsent: boolean;
  unsentAt?: Date;
  readBy: Types.ObjectId[];
  hiddenFor: Types.ObjectId[];
  reactions: IMessageReaction[];
  createdAt: Date;
}

export interface IMessage extends Document {
  conversationId: string;
  participants: Types.ObjectId[];
  messages: Types.DocumentArray<IMessageItem>;
  lastMessage?: {
    text?: string;
    sender?: Types.ObjectId;
    createdAt?: Date;
    isUnsent?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const messageReactionSchema = new Schema<IMessageReaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    emoji: { type: String, required: true, maxlength: 8 }
  },
  { _id: false }
);

const messageItemSchema = new Schema<IMessageItem>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, trim: true, maxlength: 4000 },
    mediaUrl: { type: String },
    mediaType: { type: String, enum: ["image", "video", "voice", null], default: null },
    voiceDuration: { type: Number, min: 0 },
    replyTo: { type: Schema.Types.ObjectId },
    isUnsent: { type: Boolean, default: false },
    unsentAt: { type: Date },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    hiddenFor: [{ type: Schema.Types.ObjectId, ref: "User" }],
    reactions: [messageReactionSchema],
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const messageSchema = new Schema<IMessage>(
  {
    conversationId: { type: String, required: true, unique: true, index: true },
    participants: {
      type: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
      validate: {
        validator: (participants: Types.ObjectId[]) => participants.length === 2,
        message: "A conversation must have exactly two participants"
      }
    },
    messages: [messageItemSchema],
    lastMessage: {
      text: { type: String },
      sender: { type: Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date },
      isUnsent: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

messageSchema.index({ participants: 1, updatedAt: -1 });

export const Message = mongoose.model<IMessage>("Message", messageSchema);

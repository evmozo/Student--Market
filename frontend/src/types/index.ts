export type Role = "student" | "admin";
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";
export type AccountStatus = "active" | "suspended" | "banned";
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
export type MediaType = "image" | "video" | "voice" | null;

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: Role;
  profilePicture?: string;
  coverPhoto?: string;
  bio?: string;
  school?: string;
  course?: string;
  verificationStatus: VerificationStatus;
  verificationDocument?: string;
  verificationSubmittedAt?: string;
  verificationReviewedAt?: string;
  verificationRejectionReason?: string;
  friends: string[];
  friendRequests: FriendRequest[];
  lastSeen?: string;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FriendRequest {
  from: string | User;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface PostReaction {
  user: string | User;
  type: ReactionType;
}

export interface PostComment {
  _id: string;
  user: User;
  text: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  author: User;
  title: string;
  description: string;
  price: number;
  category: PostCategory;
  type: PostType;
  images: string[];
  condition: PostCondition;
  location: string;
  status: PostStatus;
  reactions: PostReaction[];
  comments: PostComment[];
  shares: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  sender: string;
  text?: string;
  mediaUrl?: string;
  mediaType: MediaType;
  voiceDuration?: number;
  replyTo?: string;
  isUnsent: boolean;
  unsentAt?: string;
  readBy: string[];
  hiddenFor: string[];
  reactions: { user: string; emoji: string }[];
  createdAt: string;
}

export interface Conversation {
  _id: string;
  conversationId: string;
  participants: User[];
  messages?: ChatMessage[];
  lastMessage?: {
    text?: string;
    sender?: User | string;
    createdAt?: string;
    isUnsent?: boolean;
  };
  updatedAt: string;
}

export interface NotificationItem {
  _id: string;
  recipient: string;
  sender?: User;
  type:
    | "friend-request"
    | "friend-accepted"
    | "new-message"
    | "post-reaction"
    | "post-comment"
    | "verification-approved"
    | "verification-rejected";
  message: string;
  relatedPost?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Paginated<T> {
  page: number;
  total?: number;
  hasMore: boolean;
  posts?: T[];
}

import { CommentPlatform, CommentStatus, ActionType } from "@repo/db";

export type CommentHistory = {
  id: string;
  postId: string | null;
  postUrl: string;
  platform: CommentPlatform;
  authorName: string | null;
  commentContent: string;
  status: CommentStatus;
  createdAt: Date;
  action: ActionType;
};

export type Hashtag =
  | "SALES"
  | "TECHNOLOGY"
  | "GENAI"
  | "MARKETING"
  | "STARTUP"
  | "CONTENTCREATION"
  | "SOFTWAREENGINEERING"
  | "ECOMMERCE"
  | "TRENDING"
  | "FASHION"
  | "HIRING";

export type Url = {
  id: number;
  url: string;
  isValid: boolean;
  errorType?: "invalid" | "non-linkedin";
  hashtag?: Hashtag;
};

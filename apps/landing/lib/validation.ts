import { z } from "zod";
import { ActionType, CommentPlatform, Hashtag } from "@repo/db";

export const autoCommenterSchema = z.object({
  isEnabled: z.boolean(),
  timeInterval: z.number().min(5).max(60),
  action: z.array(z.nativeEnum(ActionType)).min(1),
  hashtags: z.array(z.nativeEnum(Hashtag)).max(3),
  platform: z.nativeEnum(CommentPlatform),
});

export type AutoCommenterFormData = z.infer<typeof autoCommenterSchema>;

// Scheduling Tasks Form Schema
export const taskFormSchema = z.object({
  taskType: z.enum(["COMMENT", "POST", "LIKE", "SHARE", "AUTO_COMMENT"], {
    required_error: "Please select a task type.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  scheduleDate: z.date({
    required_error: "Please select a date and time.",
  }),
  platform: z.enum(["LINKEDIN", "TWITTER", "REDDIT", "INSTAGRAM", "FACEBOOK"], {
    required_error: "Please select a platform.",
  }),
});

// Define the sample reply schema
const sampleReplySchema = z.object({
  postId: z.string(),
  reply: z.string().min(1, "Reply is required"),
});

// Custom prompt schema
export const customPromptSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  text: z.string().min(10, "Prompt must be at least 10 characters"),
});

// Define the keyword target schema
const keywordTargetSchema = z.object({
  keyword: z.string().min(1, "Keyword is required"),
  numLikes: z.number().min(0, "Number of likes must be at least 0"),
  numComments: z.number().min(0, "Number of comments must be at least 0"),
});

// Define the form schema
export const linkedinConfigurationFormSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  useBrandVoice: z.boolean().default(false),
  promoteProduct: z.boolean().default(false),
  productDetails: z.string().optional(),
  promptMode: z.enum(["automatic", "custom"]).default("automatic"),
  customPrompts: z.array(customPromptSchema).optional(),
  selectedCustomPromptId: z.string().optional(),
  feedInteractions: z.object({
    numLikes: z.number().min(0, "Number of likes must be at least 0"),
    numComments: z.number().min(0, "Number of comments must be at least 0"),
  }),
  keywordTargets: z.array(keywordTargetSchema),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;

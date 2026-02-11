import { z } from "zod";

const commentValidationSchema = z.object({
  postId: z.string(),
  content: z.string().min(1, "Comment content is required"),
});
const replyValidationSchema = z.object({
  commentId: z.string(),
  content: z.string().min(1, "Reply content is required"),
});

export const postValidation = {
  commentValidationSchema,
  replyValidationSchema,
};

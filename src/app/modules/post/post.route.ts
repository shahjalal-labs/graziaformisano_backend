import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import { parseBodyData } from "../../middlewares/parseBodyData";
import { fileUploader } from "../../../helpers/fileUploadHelper";
import { postControllers } from "./post.controller";
import { postValidation } from "./post.validation";

const router = express.Router();

router.post(
  "/create",
  auth(UserRole.USER),
  fileUploader.uploadMultiple,
  parseBodyData,
  postControllers.createPost,
);
router.get("/all", auth(UserRole.USER), postControllers.allPosts);
router.patch(
  "/like-unlike/:id",
  auth(UserRole.USER),
  postControllers.likeUnlikePost,
);
router.post(
  "/comment",
  auth(UserRole.USER),
  validateRequest(postValidation.commentValidationSchema),
  postControllers.createComment,
);
router.get(
  "/comments/:id",
  auth(UserRole.USER),
  postControllers.getPostComments,
);

router.patch(
  "/comment/like-unlike/:id",
  auth(UserRole.USER),
  postControllers.likeUnlikeComment,
);

router.post(
  "/comment/reply",
  auth(UserRole.USER),
  validateRequest(postValidation.replyValidationSchema),
  postControllers.createReply,
);

export const postRoutes = router;

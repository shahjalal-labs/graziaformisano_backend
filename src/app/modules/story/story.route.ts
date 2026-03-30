import express from "express";
import auth from "../../middlewares/auth";
import { parseBodyData } from "../../middlewares/parseBodyData";
import { fileUploader } from "../../../helpers/fileUploadHelper";
import { storyController } from "./story.controller";

const router = express.Router();

router.post(
  "/create",
  auth(),
  fileUploader.fileUrl,
  parseBodyData,
  storyController.createStory,
);

router.put(
  "/update",
  auth(),
  fileUploader.fileUrl,
  parseBodyData,
  storyController.updateStory,
);
router.get(
  "/available",
  auth(),
  storyController.getAvailableStoriesForUser,
);
router.get(
  "/user/:id",
  auth(),
  storyController.getUserWiseStories,
);
router.patch(
  "/like-unlike/:id",
  auth(),
  storyController.likeUnlikeStory,
);
router.delete(
  "/delete/:id",
  auth(),
  storyController.deleteStory,
);

export const storyRoutes = router;

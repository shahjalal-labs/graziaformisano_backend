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
router.get(
  "/available",
  auth(),
  storyController.getAvailableStoriesForUser,
);

export const storyRoutes = router;

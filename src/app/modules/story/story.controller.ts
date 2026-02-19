import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { storyService } from "./story.service";

const createStory = catchAsync(async (req, res) => {
  await storyService.createStoryInDB(req);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Story created successfully",
  });
});
const getAvailableStoriesForUser = catchAsync(async (req, res) => {
  const stories = await storyService.getAvailableStoriesForUser();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Available stories retrieved successfully",
    data: stories,
  });
});

export const storyController = {
  createStory,
  getAvailableStoriesForUser,
};

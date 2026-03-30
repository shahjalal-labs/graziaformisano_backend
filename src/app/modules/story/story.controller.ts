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
const updateStory = catchAsync(async (req, res) => {
  await storyService.updateStoryInDB(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Story updated successfully",
  });
});
const getAvailableStoriesForUser = catchAsync(async (req, res) => {
  const stories = await storyService.getAvailableStoriesForUser(req.user.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Available stories retrieved successfully",
    data: stories,
  });
});
const getUserWiseStories = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const storyPosterId = req.params.id;
  const stories = await storyService.getUserWiseStoriesFromDB(userId, storyPosterId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Stories retrieved successfully",
    data: stories,
  });
});
const likeUnlikeStory = catchAsync(async (req, res) => {
  const storyId = req.params.id;
  const userId = req.user.id;
  const result = await storyService.likeUnlikeStoryInDB(userId, storyId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
  });
});
const deleteStory = catchAsync(async (req, res) => {
  const storyId = req.params.id;
  await storyService.deleteStoryFromDB(storyId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Story deleted successfully",
  });
});

export const storyController = {
  createStory,
  getAvailableStoriesForUser,
  likeUnlikeStory,
  getUserWiseStories,
  deleteStory,
  updateStory,
};

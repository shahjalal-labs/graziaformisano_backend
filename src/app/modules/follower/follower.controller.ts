import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { followerService } from "./follower.service";
import sendResponse from "../../../shared/sendResponse";

const followUnfollow = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const followerId = req.params.id;

  const result = await followerService.followUnfollowToggleInDB(
    followerId,
    userId,
  );
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: result.message,
  });
});
const acceptFollowRequest = catchAsync(async (req: Request, res: Response) => {
  const followId = req.params.id;
  await followerService.acceptFollowRequestInDB(followId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Follow request accepted successfully",
  });
});
const rejectFollowRequest = catchAsync(async (req: Request, res: Response) => {
  const followId = req.params.id;
  await followerService.rejectFollowRequestInDB(followId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Follow request rejected successfully",
  });
});
const followerRequestList = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const followers = await followerService.getFollowerRequestListFromDB(userId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Follower list retrieved successfully",
    data: followers,
  });
});
const followersList = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const followers = await followerService.getFollowerListFromDB(userId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Followers retrieved successfully",
    data: followers,
  });
});
const getFollowingList = catchAsync(async (req: Request, res: Response) => {
  const followerId = req.user.id;
  const following = await followerService.getFollowingListFromDB(followerId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Following list retrieved successfully",
    data: following,
  });
});
const getFriendsList = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const friends = await followerService.getFriendsListFromDB(userId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Friends list retrieved successfully",
    data: friends,
  });
});

export const followerController = {
  followUnfollow,
  acceptFollowRequest,
  rejectFollowRequest,
  followerRequestList,
  followersList,
  getFollowingList,
  getFriendsList
};

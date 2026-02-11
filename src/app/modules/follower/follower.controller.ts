import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { followerService } from "./follower.service";
import sendResponse from "../../../shared/sendResponse";

const followUnfollow = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const followerId = req.params.id;

  const result = await followerService.followUnfollowToggleInDB(
    userId,
    followerId,
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
const followerList = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const followers = await followerService.getFollowerListFromDB(userId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Follower list retrieved successfully",
    data: followers,
  });
});

export const followerController = {
  followUnfollow,
  acceptFollowRequest,
  rejectFollowRequest,
  followerList,
};

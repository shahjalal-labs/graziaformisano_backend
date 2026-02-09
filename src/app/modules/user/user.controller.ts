import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { userService } from "./user.services";

// register user
const createPendingUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createPendingUserIntoDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Pending User created successfully",
    data: result,
  });
});

// register user
const createUser = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const result = await userService.createUserIntoDB(email, otp);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "User created successfully",
    data: result,
  });
});
const setUpUserProfile = catchAsync(async (req: Request, res: Response) => {
  await userService.setUpUserProfileIntoDB(req);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Profile setup completed",
  });
});
const updateUserProfile = catchAsync(async (req: Request, res: Response) => {
  await userService.updateUserProfileIntoDB(req);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Profile update completed",
  });
});
//get single user
const getProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.getProfileFromDB(req.user.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Profile retrived successfully",
    data: user,
  });
});

//delete user
const deleteUser = catchAsync(async (req: any, res: Response) => {
  const userId = req.params.id;
  const loggedId = req.user.id;
  await userService.deleteUserIntoDB(userId, loggedId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "user deleted successfully",
  });
});

export const UserControllers = {
  createUser,
  createPendingUser,
  getProfile,
  deleteUser,
  setUpUserProfile,
  updateUserProfile,
};

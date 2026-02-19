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
  const result = await userService.setUpUserProfileIntoDB(req);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Profile setup completed",
    data: result,
  });
});
const updateUserProfile = catchAsync(async (req: Request, res: Response) => {
  await userService.updateUserProfileIntoDB(req.user.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Profile update completed",
  });
});
const updateProfileImage = catchAsync(async (req: Request, res: Response) => {
  await userService.updateProfileImageInDB(req);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Profile image update completed",
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
  const userId = req.user.id;

  await userService.deleteUserIntoDB(userId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "user deleted successfully",
  });
});

const generateFileUrl = catchAsync(async (req, res) => {
  const fileUrl = await userService.urlGenerate(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "File URL generated successfully",
    data: fileUrl,
  });
});
const getUsers = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const search = req.query.search as string | undefined;
  const profession = req.query.profession as string | undefined;
  const subProfession = req.query.subProfession as string | undefined;
  const maxDistance = req.query.maxDistance
    ? parseFloat(req.query.maxDistance as string)
    : undefined;

  const users = await userService.getUsersFromDB(
    userId,
    search,
    profession,
    subProfession,
    maxDistance,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users retrieved successfully",
    data: users,
  });
});

const userDetails = catchAsync(async (req, res) => {
  const userDetails = await userService.getUserDetailsFromDB(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User details retrieved successfully",
    data: userDetails,
  });
});

export const UserControllers = {
  createUser,
  createPendingUser,
  getProfile,
  deleteUser,
  setUpUserProfile,
  updateUserProfile,
  updateProfileImage,
  generateFileUrl,
  getUsers,
  userDetails
};

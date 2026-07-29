import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { authService } from "./auth.service";
import sendResponse from "../../../shared/sendResponse";

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.loginUserIntoDB(req.body);

  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User successfully logged in",
    data: result,
  });
});
const authLogin = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.authLoginIntoDB(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User successfully logged in",
    data: result,
  });
});
const logout = catchAsync(async (req: Request, res: Response) => {
  await authService.logOutFromDB(req.user.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User successfully logged out",
  });
});

const updateUserLocation = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user;
  await authService.userLocationUpdateInDB(id, req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "location updated successfully",
  });
});

const sendForgotPasswordOtp = catchAsync(
  async (req: Request, res: Response) => {
    const email = req.body.email as string;
    const response = await authService.sendForgotPasswordOtpDB(email);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "OTP send successfully",
      data: response,
    });
  },
);

const verifyForgotPasswordOtpCode = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const response = await authService.verifyForgotPasswordOtpCodeDB(payload);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "OTP verified successfully.",
      data: response,
    });
  },
);

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { newPassword } = req.body;
  const result = await authService.resetForgotPasswordDB(newPassword, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password reset successfully.",
    data: result,
  });
});

const changePassword = catchAsync(async (req: any, res: Response) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;
  await authService.changePasswordFromDB(userId, newPassword, oldPassword);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "password changed successfully",
  });
});

const blockUnblockUser = catchAsync(async (req: Request, res: Response) => {
  const { roomId } = req.body;
  const { id } = req.user;
  const result = await authService.blockUnblockUserInDB(roomId, id);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: result.message,
  });
});
export const authController = {
  loginUser,
  authLogin,
  updateUserLocation,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtpCode,
  resetPassword,
  changePassword,
  blockUnblockUser,
  logout,
};

import prisma from "../../../shared/prisma";
import bcrypt from "bcryptjs";
import ApiError from "../../../errors/ApiErrors";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import config from "../../../config";
import { UserLocation } from "@prisma/client";
import generateOTP from "../../../helpers/generateOtp";
import sendEmail from "../../../helpers/sendEmail";

//login user
const loginUserIntoDB = async (payload: any) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.status == "Blocked") {
    throw new ApiError(
      403,
      "Your account has been deactivated. Please contact support for more information.",
    );
  }

  const isPasswordValid = await bcrypt.compare(
    payload.password,
    user?.password,
  );

  if (!isPasswordValid) {
    throw new ApiError(403, "Invalid credentials");
  }

  const accessToken = jwtHelpers.generateToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      userName: user.userName,
    },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string,
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { fcmToken: payload.fcmToken },
  });

  return {
    accessToken,
    id: user.id,
    isSetup: user.isSetup,
  };
};

const authLoginIntoDB = async (payload: any) => {
  if (!payload.email && !payload.appleId) {
    throw new ApiError(400, "Email or Apple ID is required");
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: payload.email }, { appleId: payload.appleId }],
    },
  });
  if (user) {
    const accessToken = jwtHelpers.generateToken(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.jwt_secret as string,
      config.jwt.expires_in as string,
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { fcmToken: payload.fcmToken },
    });

    return {
      accessToken,
      isSetup: user.isSetup,
    };
  } else {
    if (!payload.email || !payload.userName) {
      throw new ApiError(404, "Email and User Name is required");
    }

    const plainPassword = "12345Aa@";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const user = await prisma.user.create({
      data: {
        ...payload,
        password: hashedPassword,
        fcmToken: payload.fcmToken,
      },
    });

    const accessToken = jwtHelpers.generateToken(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.jwt_secret as string,
      config.jwt.expires_in as string,
    );

    return {
      accessToken,
      isSetup: user.isSetup,
    };
  }
};

//update or add user location
const userLocationUpdateInDB = async (
  userId: string,
  userLocation: UserLocation,
) => {
  const location = await prisma.userLocation.findFirst({
    where: { userId: userId },
  });
  if (!location) {
    const result = await prisma.userLocation.create({
      data: { ...userLocation, userId: userId },
    });

    return result;
  }

  const result = await prisma.userLocation.update({
    where: { id: location.id },
    data: userLocation,
  });

  return result;
};
//send forgot password otp
const sendForgotPasswordOtpDB = async (email: string) => {
  const existringUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!existringUser) {
    throw new ApiError(404, "User not found");
  }

  // Generate OTP and expiry time
  const otp = generateOTP(); // 4-digit OTP
  const OTP_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minute
  const expiresAt = Date.now() + OTP_EXPIRATION_TIME;
  const subject = "Your Password Reset OTP";
  const html = `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2>Password Reset Request</h2>
    <p>Hi <b>${existringUser.userName}</b>,</p>
    <p>Your OTP for password reset is:</p>
    <h1 style="color: #007BFF;">${otp}</h1>
    <p>This OTP is valid for <b>5 minutes</b>. If you did not request this, please ignore this email.</p>
    <p>Thanks, <br>The Support Team</p>
  </div>
`;
  await sendEmail(email, subject, html);
  await prisma.otp.upsert({
    where: {
      email: email,
    },
    update: { otpCode: otp, expiresAt: new Date(expiresAt) },
    create: { email: email, otpCode: otp, expiresAt: new Date(expiresAt) },
  });

  return otp;
};

// verify otp code
const verifyForgotPasswordOtpCodeDB = async (payload: any) => {
  const { email, otp } = payload;

  if (!email && !otp) {
    throw new ApiError(400, "Email and OTP are required.");
  }

  const user = await prisma.user.findUnique({ where: { email: email } });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const userId = user.id;

  const verifyData = await prisma.otp.findUnique({
    where: {
      email: email,
    },
  });

  if (!verifyData) {
    throw new ApiError(400, "Invalid or expired OTP.");
  }

  const { otpCode: savedOtp, expiresAt } = verifyData;

  if (otp !== savedOtp) {
    throw new ApiError(401, "Invalid OTP.");
  }

  if (Date.now() > expiresAt.getTime()) {
    await prisma.otp.delete({
      where: {
        email: email,
      },
    }); // OTP has expired
    throw new ApiError(410, "OTP has expired. Please request a new OTP.");
  }

  // OTP is valid
  await prisma.otp.delete({
    where: {
      email: email,
    },
  });

  const accessToken = jwtHelpers.generateToken(
    { id: userId, email },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string,
  );

  return { accessToken: accessToken };
};

// reset password
const resetForgotPasswordDB = async (newPassword: string, userId: string) => {
  const existingUser = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.jwt.gen_salt),
  );

  await prisma.user.update({
    where: {
      id: existingUser.id,
    },
    data: {
      password: hashedPassword,
    },
  });

  return;
};

const changePasswordFromDB = async (
  userId: string,
  newPassword: string,
  oldPassword: string,
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (
    !existingUser ||
    !(await bcrypt.compare(oldPassword, existingUser.password))
  ) {
    throw new Error("Invalid old password");
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.jwt.gen_salt),
  );

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return;
};

const blockUnblockUserInDB = async (roomId: string, userId: string) => {
  const room = await prisma.room.findUniqueOrThrow({
    where: {
      id: roomId,
    },
  });


  if (room.senderId !== userId && room.receiverId !== userId) {
    throw new ApiError(400, "You are not a participant of this room");
  }

  await prisma.room.update({
    where: {
      id: roomId,
    },
    data: {
      isBlocked: !room.isBlocked,
      blockerId: room.isBlocked ? null : userId,
    },
  });

  return {
    message: room.isBlocked
      ? "User unblocked successfully"
      : "User blocked successfully",
  };
};

export const authService = {
  loginUserIntoDB,
  userLocationUpdateInDB,
  sendForgotPasswordOtpDB,
  verifyForgotPasswordOtpCodeDB,
  resetForgotPasswordDB,
  changePasswordFromDB,
  authLoginIntoDB,
  blockUnblockUserInDB,
};

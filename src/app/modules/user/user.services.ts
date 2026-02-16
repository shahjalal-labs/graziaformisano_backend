import { PendingUser, User, UserProfile, UserRole } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import bcrypt from "bcryptjs";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import config from "../../../config";
import prisma from "../../../shared/prisma";
import sendEmail from "../../../helpers/sendEmail";
import generateOTP from "../../../helpers/generateOtp";
import { emailBody } from "../../../helpers/EmailBody";
import { Request } from "express";
import { uploadInSpace } from "../../../shared/UploadHelper";

//create new user
const createPendingUserIntoDB = async (payload: PendingUser) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (existingUser) {
    throw new ApiError(409, "Email already exists!");
  }

  const hashedPassword = await bcrypt.hash(payload.password as string, 10);
  const otp = generateOTP();

  const OTP_EXPIRATION_TIME = 5 * 60 * 1000;
  const expiresAt = Date.now() + OTP_EXPIRATION_TIME;
  const subject = "Your Account Verification OTP";
  const html = emailBody(payload.userName, otp);

  await sendEmail(payload.email, subject, html);
  await prisma.pendingUser.upsert({
    where: {
      email: payload.email,
    },
    update: { otpCode: otp, expiresAt: new Date(expiresAt) },
    create: {
      ...payload,
      password: hashedPassword,
      otpCode: otp,
      expiresAt: new Date(expiresAt),
    },
  });

  return otp;
};

//create new user
const createUserIntoDB = async (email: string, otp: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: email },
  });
  if (existingUser) {
    throw new ApiError(409, "User Already exists!");
  }

  const userPending = await prisma.pendingUser.findUnique({
    where: { email: email },
  });
  if (!userPending) {
    throw new ApiError(409, "User doesn't exist!");
  }

  const { otpCode, expiresAt, userName } = userPending;

  if (otp !== otpCode) {
    throw new ApiError(401, "Invalid OTP.");
  }

  if (Date.now() > expiresAt.getTime()) {
    await prisma.pendingUser.delete({
      where: {
        email: userPending.email,
      },
    }); // OTP has expired
    throw new ApiError(410, "OTP has expired. Please request a new OTP.");
  }

  // OTP is valid
  await prisma.pendingUser.delete({
    where: {
      email: email,
    },
  });

  const user = await prisma.user.create({
    data: {
      email: email,
      password: userPending.password,
      userName: userName,
      role: "USER",
    },
  });

  const accessToken = jwtHelpers.generateToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string,
  );

  return {
    accessToken,
    id: user.id,
    role: user.role,
  };
};

const setUpUserProfileIntoDB = async (req: Request) => {
  const userId = req.user.id;
  const payload = req.body;
  const file = req.file;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId, role: "USER" },
  });

  const processImage = async (file: Express.Multer.File, folder: string) => {
    if (!file) return null;
    return uploadInSpace(file, `courses/${folder}`);
  };

  const profileImage = file ? await processImage(file, "profileImage") : null;
  if (!profileImage) {
    throw new ApiError(404, "Image is required");
  }

  await prisma.userProfile.create({
    data: {
      userId,
      bio: payload.bio,
      city: payload.city,
      profession: payload.profession,
      subProfession: payload.subProfession,
      education: payload.education,
      skills: payload.skills,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      isSetup: true,
      profileImage,
    },
  });

  const accessToken = jwtHelpers.generateToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string,
  );

  return {
    accessToken,
    id: user.id,
  };
};

const updateUserProfileIntoDB = async (userId: string, payload: any) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId, role: "USER" },
    include: {
      userProfile: true,
    },
  });

  await prisma.userProfile.update({
    where: { userId },
    data: {
      userId,
      bio: payload.bio || user.userProfile?.bio,
      city: payload.city || user.userProfile?.city,
      profession: payload.profession || user.userProfile?.profession,
      subProfession: payload.subProfession || user.userProfile?.subProfession,
      education: payload.education || user.userProfile?.education,
      skills: payload.skills || user.userProfile?.skills,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      userName: payload.userName || user.userName,
    },
  });
  return;
};

const updateProfileImageInDB = async (req: Request) => {
  const userId = req.user.id;
  const file = req.file;

  const processImage = async (file: Express.Multer.File, folder: string) => {
    if (!file) return null;
    return uploadInSpace(file, `courses/${folder}`);
  };

  const profileImage = file ? await processImage(file, "profileImage") : null;

  if (!profileImage) {
    throw new ApiError(404, "Image is required");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      profileImage: profileImage,
    },
  });

  return;
};

//get single user
const getProfileFromDB = async (id: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
    select: {
      id: true,
      userName: true,
      email: true,
      profileImage: true,
      userProfile: {
        select: {
          bio: true,
          city: true,
          profession: true,
          subProfession: true,
          education: true,
          skills: true,
          attendance: true,
          followers: true,
          hosted: true,
        },
      },
    },
  });

  return user;
};

//delete user
const deleteUserIntoDB = async (userId: string) => {
  await prisma.user.delete({
    where: { id: userId },
  });
  return;
};

const urlGenerate = async (req: Request) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const processImages = async (files?: Express.Multer.File[]) => {
    if (!files || files.length === 0) return null;
    return Promise.all(
      files.map((file) => uploadInSpace(file, "messages/files"))
    );
  };

  const [fileUrl] = await Promise.all([processImages(files["fileUrl"])]);

  return fileUrl;
};

export const userService = {
  createUserIntoDB,
  createPendingUserIntoDB,
  setUpUserProfileIntoDB,
  getProfileFromDB,
  deleteUserIntoDB,
  updateUserProfileIntoDB,
  updateProfileImageInDB,
  urlGenerate
};

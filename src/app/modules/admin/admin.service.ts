import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import prisma from "../../../shared/prisma";
import bcrypt from "bcryptjs";
import { uploadInSpace } from "../../../shared/UploadHelper";
import { Request } from "express";
import { Prisma } from "@prisma/client";
import { get } from "http";

const loginAdminIntoDB = async (payload: any) => {
  const admin = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      role: "ADMIN",
    },
  });

  const isPasswordValid = await bcrypt.compare(
    payload.password,
    admin?.password,
  );

  if (!isPasswordValid) {
    throw new ApiError(403, "Invalid credentials");
  }

  const accessToken = jwtHelpers.generateToken(
    {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      userName: admin.userName,
    },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string,
  );

  return {
    accessToken,
  };
};

const updateAdminProfileInDB = async (req: Request) => {
  const file = req.file;
  const payload = req.body;

  const admin = await prisma.user.findUniqueOrThrow({
    where: { id: req.user.id, role: "ADMIN" },
  });

  const processImage = async (file: Express.Multer.File, folder: string) => {
    if (!file) return null;
    return uploadInSpace(file, `courses/${folder}`);
  };

  const profileImage = file ? await processImage(file, "profileImage") : null;

  await prisma.user.update({
    where: { id: req.user.id },
    data: {
      userName: payload.userName || admin.userName,
      profileImage: profileImage || admin.profileImage,
    },
  });

  return;
};

const getAllUsersFromDB = async (page: number = 1, search?: string) => {
  const whereCondition: Prisma.UserWhereInput = {
    role: "USER",
    ...(search && {
      OR: [
        { userName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        {
          userProfile: {
            profession: { contains: search, mode: "insensitive" },
          },
        },
        { userProfile: { skills: { has: search } } },
        {
          userProfile: {
            subProfession: { contains: search, mode: "insensitive" },
          },
        },
      ],
    }),
  };

  const totalUsers = await prisma.user.count({
    where: { role: "USER" },
  });

  const filteredUsersCount = await prisma.user.count({
    where: whereCondition,
  });

  const totalPages = Math.ceil(filteredUsersCount / 10);

  const users = await prisma.user.findMany({
    where: whereCondition,
    skip: (page - 1) * 10,
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      profileImage: true,
      userName: true,
      status: true,
      userProfile: {
        select: {
          profession: true,
          skills: true,
          subProfession: true,
        },
      },
      email: true,
      createdAt: true,
    },
  });

  return {
    meta: {
      totalUsers,
      filteredUsers: filteredUsersCount,
      totalPages,
      currentPage: page,
    },
    users,
  };
};
const getAllPostsFromDB = async (page: number = 1) => {
  const totalPosts = await prisma.post.count({});
  const filteredPostsCount = await prisma.post.count({});
  const totalPages = Math.ceil(filteredPostsCount / 10);

  const posts = await prisma.post.findMany({
    skip: (page - 1) * 10,
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      content: true,
      mediaUrls: true,
      totalComment: true,
      createdAt: true,
      likes: true,      
      user: {
        select: {
          userName: true,
          profileImage: true,
        },
      },
      
    },
  });

  return {
    meta: {
      totalPosts,
      filteredPosts: filteredPostsCount,
      totalPages,
      currentPage: page,
    },
    posts,
  };
};
const getAllSubscribersFromDB = async (page: number = 1) => {
  const totalSubscribers = await prisma.userSubscription.count({
    where: { status: "ACTIVE" },
  });

  const filteredSubscribersCount = await prisma.userSubscription.count({
    where: { status: "ACTIVE" },
  });

  const totalPages = Math.ceil(filteredSubscribersCount / 10);

  const subscribers = await prisma.userSubscription.findMany({
    where: { status: "ACTIVE" },
    skip: (page - 1) * 10,
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      subscriptionPayId: true,
      subscriptionId: true,
      subscriptionTitleType: true,
      user: {
        select: {
          userName: true,
          email: true,

          profileImage: true,
          userProfile: {
            select: {
              profession: true,
            },
          },
        },
      },
      createdAt: true,
    },
  });

  return {
    meta: {
      totalSubscribers,
      filteredSubscribers: filteredSubscribersCount,
      totalPages,
      currentPage: page,
    },
    subscribers,
  };
};
const getAllEventsFromDB = async (page: number = 1, search?: string) => {
  const whereCondition: Prisma.EventWhereInput = {
    ...(search && {
      OR: [
        { eventName: { contains: search, mode: "insensitive" } },
        {
          user: {
            userName: { contains: search, mode: "insensitive" },
          },
        },
      ],
    }),
  };

  const totalEvents = await prisma.event.count({});

  const filteredEventsCount = await prisma.event.count({
    where: whereCondition,
  });

  const totalPages = Math.ceil(filteredEventsCount / 10);

  const events = await prisma.event.findMany({
    where: whereCondition,
    skip: (page - 1) * 10,
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      eventName: true,
      eventType: true,
      eventDate: true,
      eventTime: true,    
      eventCategory: true,
      user: {
        select: {
          userName: true,
          profileImage: true,
        },
      },
      createdAt: true,
    },
  });

  return {
    meta: {
      totalEvents,
      filteredEvents: filteredEventsCount,
      totalPages,
      currentPage: page,
    },
    events,
  };
};

const getUserDetailsFromDB = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      userName: true,
      email: true,
      profileImage: true,
      status: true,
      userProfile: {
        select: {
          profession: true,
          subProfession: true,
          skills: true,
          bio: true,
          education: true,
        },
      },
    },
  });

  return user;
};

const getEventDetailsFromDB = async (eventId: string) => {
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
    select: {
      id: true,
      eventName: true,
      eventType: true,
      eventDate: true,
      eventTime: true,
      description: true,
      eventCategory: true,
      eventPlace: true,
      attendeesCount: true,
      maxAttendence: true,
      address: true,
      agenda: true,
      user: {
        select: {
          userName: true,
          profileImage: true,
        },
      },
    },
  });

  return event;
};

const deleteUserFromDB = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      status: user.status == "Active" ? "Deleted" : "Active",
    },
  });

  return {
    message: `User ${user.status == "Active" ? "deleted" : "activated"} successfully`,
  };
};

const deleteEventFromDB = async (eventId: string) => {
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
  });

  const now = new Date();
  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );

  if (event.eventDate <= endOfToday) {
    throw new ApiError(400, "Only future events can be deleted");
  }

  await prisma.event.delete({
    where: { id: eventId },
  });

  await prisma.userProfile.update({
    where: { userId: event.userId },
    data: {
      hosted: { decrement: 1 },
    },
  });

  return;
};

const getDashboardStatsFromDB = async () => {
  const totalUsers = await prisma.user.count({
    where: { role: "USER" },
  });
  const totalPrivateEvents = await prisma.event.count({
    where: { eventType: "Private" },
  });
  const totalPublicEvents = await prisma.event.count({
    where: { eventType: "Public" },
  });
  const totalPosts = await prisma.post.count({});

  return {
    totalUsers,
    totalPrivateEvents,
    totalPublicEvents,
    totalPosts,
  };
};

const getTopProfessionalsFromDB = async () => {
  const topProfessionals = await prisma.user.findMany({
    select: {
      id: true,
      userName: true,
      profileImage: true,
      userProfile: {
        select: {
          followers: true,
        },
      },
    },
    orderBy: {
      userProfile: {
        followers: "desc",
      },
    },
    take: 4,
  });

  return topProfessionals;
};

export const adminService = {
  loginAdminIntoDB,
  updateAdminProfileInDB,
  getAllUsersFromDB,
  getAllEventsFromDB,
  getUserDetailsFromDB,
  getDashboardStatsFromDB,
  getEventDetailsFromDB,
  deleteUserFromDB,
  deleteEventFromDB,
  getAllSubscribersFromDB,
  getTopProfessionalsFromDB,
  getAllPostsFromDB,
};

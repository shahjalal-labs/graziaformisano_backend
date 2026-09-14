import { Request } from "express";
import ApiError from "../../../errors/ApiErrors";
import { uploadInSpace } from "../../../shared/UploadHelper";
import prisma from "../../../shared/prisma";
import { canUseAccount } from "../../../helpers/subscriptionChecker";
import { StoryType } from "@prisma/client";

const isVideoUrl = (url: string) => {
  return /\.(mp4|mov|mkv|webm|avi|flv|wmv|m4v)(\?.*)?$/i.test(url);
};

const createStoryInDB = async (req: Request) => {
  const userId = req.user.id;
  const file = req.file;
  const payload = req.body;

  const res = await canUseAccount(userId);

  if (!res) {
    throw new ApiError(
      403,
      "Your 6-month trial has ended. Subscribe to keep using all features.",
    );
  }

  const processImage = async (file: Express.Multer.File, folder: string) => {
    if (!file) return null;
    return uploadInSpace(file, folder);
  };

  const uploadedUrl = file ? await processImage(file, "stories") : null;
  const fileUrl = uploadedUrl || payload.fileUrl || null;

  if (!fileUrl && !payload.content) {
    throw new ApiError(400, "Story content or media is required");
  }

  let storyType: StoryType | undefined = payload.storyType;
  if (!storyType) {
    if (file) {
      storyType = file.mimetype.startsWith("video/")
        ? StoryType.VIDEO
        : StoryType.IMAGE;
    } else if (fileUrl) {
      storyType = isVideoUrl(fileUrl) ? StoryType.VIDEO : StoryType.IMAGE;
    } else {
      storyType = StoryType.TEXT;
    }
  }

  await prisma.story.create({
    data: {
      userId,
      content: payload.content,
      fileUrl: fileUrl,
      storyType: storyType,
      viewedBy: ["sdfdfsdf"],
    },
  });

  return;
};

const getAvailableStoriesForUser = async (userId: string) => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Get all users who have stories in the last 24 hours
  const allStoryCounts = await prisma.story.groupBy({
    by: ["userId"],
    where: {
      createdAt: { gte: since },
    },
    _count: {
      _all: true,
    },
  });

  // Get count of unviewed stories per user
  const unviewedStoryCounts = await prisma.story.groupBy({
    by: ["userId"],
    where: {
      createdAt: { gte: since },
      NOT: {
        viewedBy: { has: userId },
      },
    },
    _count: {
      _all: true,
    },
  });

  const userIds = allStoryCounts.map((item) => item.userId);

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, userName: true, profileImage: true },
  });

  const userMap = new Map(users.map((user) => [user.id, user.userName]));
  const unviewedCountMap = new Map(
    unviewedStoryCounts.map((item) => [item.userId, item._count._all]),
  );

  return allStoryCounts.map((item) => ({
    userId: item.userId,
    userName: userMap.get(item.userId) || "",
    profileImage:
      users.find((user) => user.id === item.userId)?.profileImage || "",
    storyCount: unviewedCountMap.get(item.userId) || 0,
  }));
};

const getUserWiseStoriesFromDB = async (
  userId: string,
  storyPosterId: string,
) => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const stories = await prisma.story.findMany({
    where: {
      userId: storyPosterId,
      createdAt: { gte: since },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      fileUrl: true,
      storyType: true,
      likes: true,
      createdAt: true,
    },
  });
  await prisma.story.updateMany({
    where: {
      userId: storyPosterId,
      createdAt: { gte: since },
      NOT: { viewedBy: { has: userId } },
    },
    data: { viewedBy: { push: userId } },
  });

  return stories.map((story) => ({
    id: story.id,
    content: story.content,
    fileUrl: story.fileUrl,
    storyType: story.storyType,
    createdAt: story.createdAt,
    isLiked: story.likes.includes(userId),
  }));
};

const likeUnlikeStoryInDB = async (userId: string, storyId: string) => {
  await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const story = await prisma.story.findUniqueOrThrow({
    where: { id: storyId },
  });

  const res = await canUseAccount(userId);

  if (!res) {
    throw new ApiError(
      403,
      "Your 6-month trial has ended. Subscribe to keep using all features.",
    );
  }

  const isLiked = story.likes.includes(userId);

  if (isLiked) {
    await prisma.story.update({
      where: { id: storyId },
      data: {
        likes: {
          set: story.likes.filter((id) => id !== userId),
        },
      },
    });
    return { message: "Story unliked successfully" };
  } else {
    await prisma.story.update({
      where: { id: storyId },
      data: {
        likes: {
          push: userId,
        },
      },
    });
    return { message: "Story liked successfully" };
  }
};

const updateStoryInDB = async (req: Request) => {
  const payload = req.body || {};
  const file = req.file;

  const storyId = payload.storyId || req.params.id;
  if (!storyId) {
    throw new ApiError(400, "storyId is required");
  }

  const story = await prisma.story.findUniqueOrThrow({
    where: { id: storyId },
  });

  const processImage = async (file: Express.Multer.File, folder: string) => {
    if (!file) return null;
    return uploadInSpace(file, folder);
  };

  const uploadedUrl = file ? await processImage(file, "stories") : null;
  const fileUrl = uploadedUrl || payload.fileUrl || story.fileUrl;

  let storyType: StoryType | undefined = payload.storyType;
  if (!storyType) {
    if (file) {
      storyType = file.mimetype.startsWith("video/")
        ? StoryType.VIDEO
        : StoryType.IMAGE;
    } else if (payload.fileUrl) {
      storyType = isVideoUrl(payload.fileUrl)
        ? StoryType.VIDEO
        : StoryType.IMAGE;
    } else {
      storyType = story.storyType ?? undefined;
    }
  }

  await prisma.story.update({
    where: { id: storyId },
    data: {
      content: payload.content ?? story.content,
      fileUrl: fileUrl,
      storyType: storyType,
    },
  });

  return;
};

const deleteStoryFromDB = async (storyId: string) => {
  await prisma.story.delete({
    where: { id: storyId },
  });

  return;
};

export const storyService = {
  createStoryInDB,
  getAvailableStoriesForUser,
  getUserWiseStoriesFromDB,
  likeUnlikeStoryInDB,
  deleteStoryFromDB,
  updateStoryInDB,
};

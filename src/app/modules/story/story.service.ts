import { Request } from "express";
import ApiError from "../../../errors/ApiErrors";
import { uploadInSpace } from "../../../shared/UploadHelper";
import prisma from "../../../shared/prisma";

const createStoryInDB = async (req: Request) => {
  const userId = req.user.id;
  const file = req.file;
  const payload = req.body;

  const processImage = async (file: Express.Multer.File, folder: string) => {
    if (!file) return null;
    return uploadInSpace(file, `courses/${folder}`);
  };

  const fileUrl = file ? await processImage(file, "profileImage") : null;

  if (!fileUrl && !payload.content) {
    throw new ApiError(400, "Story content or media is required");
  }

  await prisma.story.create({
    data: {
      userId,
      content: payload.content,
      fileUrl: fileUrl,
    },
  });

  return;
};

const getAvailableStoriesForUser = async () => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const storyCounts = await prisma.story.groupBy({
    by: ["userId"],
    where: {
      createdAt: { gte: since },
    },
    _count: {
      _all: true,
    },
  });

  const userIds = storyCounts.map((item) => item.userId);

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, userName: true },
  });

  const userMap = new Map(users.map((user) => [user.id, user.userName]));

  return storyCounts.map((item) => ({
    userId: item.userId,
    userName: userMap.get(item.userId) || "",
    storyCount: item._count._all,
  }));
};

export const storyService = {
  createStoryInDB,
  getAvailableStoriesForUser,
};

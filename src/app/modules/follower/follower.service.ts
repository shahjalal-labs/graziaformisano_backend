import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

const followUnfollowToggleInDB = async (userId: string, followerId: string) => {
  if (userId === followerId) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  await prisma.user.findUniqueOrThrow({
    where: { id: followerId },
  });

  const existingFollowRequest = await prisma.follower.findUnique({
    where: {
      userId_followerId: {
        userId,
        followerId,
      },
    },
  });

  if (existingFollowRequest) {
    await prisma.follower.delete({
      where: {
        userId_followerId: {
          userId,
          followerId,
        },
      },
    });

    if (existingFollowRequest.isAccepted) {
      await prisma.userProfile.update({
        where: { userId },
        data: {
          followers: { decrement: 1 },
        },
      });
    }

    return { message: "Follow request canceled successfully" };
  }

  await prisma.follower.create({
    data: {
      userId,
      followerId,
    },
  });

  return { message: "Follow request created successfully" };
};

const acceptFollowRequestInDB = async (followId: string) => {
  const followRequest = await prisma.follower.findUniqueOrThrow({
    where: { id: followId, isAccepted: false },
  });

  await prisma.follower.update({
    where: { id: followId },
    data: { isAccepted: true },
  });

  await prisma.userProfile.update({
    where: { userId: followRequest.userId },
    data: {
      followers: { increment: 1 },
    },
  });

  return;
};

const rejectFollowRequestInDB = async (followId: string) => {
  await prisma.follower.findUniqueOrThrow({
    where: { id: followId, isAccepted: false },
  });

  await prisma.follower.delete({
    where: { id: followId },
  });

  return;
};

const getFollowerListFromDB = async (userId: string) => {
  const followers = await prisma.follower.findMany({
    where: { userId, isAccepted: false },
    select: {
      id: true,
      follower: {
        select: {
          userName: true,
          profileImage: true,
          userProfile: {
            select: {
                profession:true,
                city:true,
            }
          }
        },
      },
    },
  });

  return followers;
};

export const followerService = {
  followUnfollowToggleInDB,
  acceptFollowRequestInDB,
  rejectFollowRequestInDB,
  getFollowerListFromDB,
};

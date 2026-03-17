import { count } from "console";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { sendSingleNotification } from "../notifications/notification.services";

const followUnfollowToggleInDB = async (userId: string, followerId: string) => {
  if (userId === followerId) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  const user = await prisma.user.findUniqueOrThrow({
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
    select: {
      isAccepted: true,
      userId: true,
      followerId: true,
      user: {
        select: {
          userName: true,
        },
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

    return { message: "Follow request cancelled successfully" };
  }

  await prisma.follower.create({
    data: {
      userId,
      followerId,
    },
  });

  try {
    await sendSingleNotification(
      userId,
      `${user.userName} sent you a follow request`,
      followerId,
      "New Follow Request!",
    );
  } catch (notificationError) {
    console.error("Notification failed:", notificationError);
  }

  return { message: "Follow request created successfully" };
};

const acceptFollowRequestInDB = async (followId: string) => {
  const followRequest = await prisma.follower.findUniqueOrThrow({
    where: { id: followId, isAccepted: false },
    include: {
      follower: {
        select: {
          userName: true,
        },
      },
    },
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

  try {
    await sendSingleNotification(
      followRequest.userId,
      `${followRequest.follower.userName} accepted your follow request`,
      followRequest.followerId,
      "Follow Request Accepted!",
    );
  } catch (notificationError) {
    console.error("Notification failed:", notificationError);
  }

  return;
};

const rejectFollowRequestInDB = async (followId: string) => {
  const followRequest = await prisma.follower.findUniqueOrThrow({
    where: { id: followId, isAccepted: false },
    include: {
      follower: {
        select: {
          userName: true,
        },
      },
    },
  });

  await prisma.follower.delete({
    where: { id: followId },
  });

  try {
    await sendSingleNotification(
      followRequest.userId,
      `${followRequest.follower.userName} rejected your follow request`,
      followRequest.followerId,
      "Follow Request Rejected!",
    );
  } catch (notificationError) {
    console.error("Notification failed:", notificationError);
  }

  return;
};

const getFollowerRequestListFromDB = async (userId: string) => {
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
              profession: true,
              city: true,
            },
          },
        },
      },
    },
  });

  return followers;
};
const getFollowerListFromDB = async (userId: string) => {
  const followers = await prisma.follower.findMany({
    where: { userId, isAccepted: true },
    select: {
      id: true,
      follower: {
        select: {
          id: true,
          userName: true,
          profileImage: true,
          userProfile: {
            select: {
              profession: true,
              city: true,
            },
          },
        },
      },
    },
  });

  const followerIds = followers.map((item) => item.follower.id);

  const sentFollowRequests = await prisma.follower.findMany({
    where: {
      userId: { in: followerIds },
      followerId: userId,
    },
    select: {
      userId: true,
      isAccepted: true,
    },
  });

  const sentFollowRequestMap = new Map(
    sentFollowRequests.map((item) => [item.userId, item.isAccepted]),
  );

  return followers.map((item) => {
    const requestAccepted = sentFollowRequestMap.get(item.follower.id);

    return {
      ...item,
      isFollowRequestSent: requestAccepted !== undefined,
      isFollowRequestAccepted: requestAccepted ?? false,
    };
  });
};

const getFollowingListFromDB = async (followerId: string) => {
  const following = await prisma.follower.findMany({
    where: { followerId },
    select: {
      id: true,
      isAccepted: true,
      user: {
        select: {
          id: true,
          userName: true,
          profileImage: true,
          userProfile: {
            select: {
              profession: true,
              city: true,
            },
          },
        },
      },
    },
  });

  return following;
};
const getFriendsListFromDB = async (userId: string) => {
  const friends = await prisma.follower.findMany({
    where: {
      isAccepted: true,
      OR: [{ userId }, { followerId: userId }],
    },
    select: {
      id: true,
      userId: true,
      followerId: true,
      user: {
        select: {
          id: true,
          userName: true,
          profileImage: true,
        },
      },
      follower: {
        select: {
          id: true,
          userName: true,
          profileImage: true,
        },
      },
    },
  });

  const formattedFriends = friends.map((item) => {
    if (item.userId === userId) {
      return item.follower;
    } else {
      return item.user;
    }
  });

  return formattedFriends;
};

export const followerService = {
  followUnfollowToggleInDB,
  acceptFollowRequestInDB,
  rejectFollowRequestInDB,
  getFollowerRequestListFromDB,
  getFollowerListFromDB,
  getFollowingListFromDB,
  getFriendsListFromDB,
};

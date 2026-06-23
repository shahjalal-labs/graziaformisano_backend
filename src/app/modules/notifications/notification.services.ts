import { TNotificationType } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import admin from "../../../helpers/firebase.admin";
import prisma from "../../../shared/prisma";
import { calculateDistanceKm } from "../../../helpers/distanceCalculator";

// Send notification to a single user
export const sendSingleNotification = async (
  receiverId: string,
  content: string,
  senderId?: string,
  title?: string,
  type?: TNotificationType,
  eventId?: string,
) => { 

  const user = await prisma.user.findUnique({
    where: { id: receiverId },
  });

  if (!user?.fcmToken) {
    await prisma.notification.create({
      data: {
        title,
        receiverId,
        senderId,
        content,
        type,
        eventId,
      },
    });
    throw new ApiError(404, "User not found with FCM token");
  }

  const message = {
    notification: {
      title: title || "Notification",
      body: content,
    },
    token: user.fcmToken,
  };

  await prisma.notification.create({
    data: {
      title,
      receiverId,
      senderId,
      content,
      type,
      eventId,
    },
  });

  try {
    const response = await admin.messaging().send(message);
    return response;
  } catch (error: any) {
    if (error.code === "messaging/invalid-registration-token") {
      throw new ApiError(400, "Invalid FCM registration token");
    } else if (error.code === "messaging/registration-token-not-registered") {
      throw new ApiError(404, "FCM token is no longer registered");
    } else {
      return;
    }
  }
};

// export const sendNotifications = async (
//   body: string,
//   title: string,
//   senderId: string,
//   eventId?: string,
// ) => {
//   const senderLocation = await prisma.userLocation.findFirst({
//     where: { userId: senderId },
//   });

//   console.log("Sender Location:", senderLocation);

//   try {
//     const users = await prisma.user.findMany({
//       where: { fcmToken: { not: null } },
//       select: { id: true, fcmToken: true },
//     });

//     if (users.length === 0) {
//       throw new ApiError(404, "No users found with valid FCM tokens.");
//     }

//     const fcmTokens = users.map((user) => user.fcmToken);

//     const message = {
//       notification: {
//         title: title || "Notification",
//         body: body,
//       },
//       tokens: fcmTokens,
//     };
//     const response = await admin
//       .messaging()
//       .sendEachForMulticast(message as any);
//     const successIndices = response.responses
//       .map((res, idx) => (res.success ? idx : null))
//       .filter((idx) => idx !== null) as number[];

//     const successfulUsers = successIndices.map((idx) => users[idx]);
//     if (successfulUsers.length > 0) {
//       await prisma.notification.createMany({
//         data: successfulUsers.map((user) => ({
//           receiverId: user.id,
//           title: title || "Notification",
//           content: body,
//           senderId,
//           type: "Event",
//           eventId,
//         })),
//       });
//     }
//     const failedTokens = response.responses
//       .map((res, idx) => (!res.success ? fcmTokens[idx] : null))
//       .filter((token) => token !== null);

//     return {
//       successCount: response.successCount,
//       failureCount: response.failureCount,
//       failedTokens,
//     };
//   } catch (error) {
//     throw new ApiError(500, "Failed to send notifications.");
//   }
// };


export const sendNotifications = async (
  body: string,
  title: string,
  senderId: string,
  eventId?: string
) => {
  try {
    const senderLocation = await prisma.userLocation.findFirst({
      where: { userId: senderId },
    });

    if (!senderLocation) {
      throw new ApiError(404, "Sender location not found.");
    }

    const users = await prisma.user.findMany({
      where: {
        fcmToken: {
          not: null,
        },
        id: {
          not: senderId,
        },
      },
      select: {
        id: true,
        fcmToken: true,
       userLocation: {
        select : {
          latitude: true,
          longitude: true,
        }
       }
      },
    });

    const nearbyUsers = users.filter((user) => {
      if (!user.userLocation) return false;

      const distance = calculateDistanceKm(
        senderLocation.latitude,
        senderLocation.longitude,
        user.userLocation[0].latitude,
        user.userLocation[0].longitude
      );

      return distance <= 50;
    });

    if (nearbyUsers.length === 0) {
      return {
        successCount: 0,
        failureCount: 0,
        failedTokens: [],
        message: "No users found within 50 KM.",
      };
    }

    const fcmTokens = nearbyUsers
      .map((user) => user.fcmToken)
      .filter(Boolean) as string[];

    const message = {
      notification: {
        title: title || "Notification",
        body,
      },
      tokens: fcmTokens,
    };

    const response = await admin
      .messaging()
      .sendEachForMulticast(message);

    const successIndices = response.responses
      .map((res, idx) => (res.success ? idx : null))
      .filter((idx) => idx !== null) as number[];

    const successfulUsers = successIndices.map(
      (idx) => nearbyUsers[idx]
    );

    if (successfulUsers.length > 0) {
      await prisma.notification.createMany({
        data: successfulUsers.map((user) => ({
          receiverId: user.id,
          title: title || "Notification",
          content: body,
          senderId,
          type: "Event",
          eventId,
        })),
      });
    }

    const failedTokens = response.responses
      .map((res, idx) => (!res.success ? fcmTokens[idx] : null))
      .filter(Boolean);

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      failedTokens,
    };
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Failed to send notifications.");
  }
};


const getNotificationsFromDB = async (req: any) => {
  const notifications = await prisma.notification.findMany({
    where: {
      receiverId: req.user.id,
    },
    orderBy: { createdAt: "desc" },
    include: {
      sender: {
        select: {
          profileImage: true,
          userName: true,
        },
      },
    },
  });

  const totalUnread = await prisma.notification.count({
    where: {
      receiverId: req.user.id,
      isRead: false,
    },
  });

  return {
    notifications,
    totalUnread,
  };
};

const getSingleNotificationFromDB = async (
  req: any,
  notificationId: string,
) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      receiverId: req.user.id,
    },
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found for the user");
  }

  const updateNotification = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  return updateNotification;
};

const markAllReadInDB = async (userId: string) => {
  await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  await prisma.notification.updateMany({
    where: { receiverId: userId, isRead: false },
    data: { isRead: true },
  });

  return;
};

export const sendAdminNotifications = async (
  body: string,
  title: string,
  company?: string,
  profession?: string,
) => {
  const whereCondition: any = {
    user: { fcmToken: { not: null } },
  };

  const adminAccount = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  // Role-based filtering (only if role is provided)
  if (company) {
    whereCondition.company = company;
  }

  if (profession) {
    whereCondition.profession = profession;
  }

  const userProfiles = await prisma.userProfile.findMany({
    where: whereCondition,
    select: { user: { select: { id: true, fcmToken: true } } },
  });

  if (userProfiles.length === 0) {
    throw new ApiError(404, "No users found with valid FCM tokens.");
  }

  const fcmTokens = userProfiles
    .map((profile) => profile.user?.fcmToken)
    .filter(
      (token): token is string => typeof token === "string" && token.length > 0,
    );

  const message = {
    notification: {
      title: title || "Notification",
      body,
    },
    tokens: fcmTokens,
  };

  const response = await admin.messaging().sendEachForMulticast(message as any);

  const successIndices = response.responses
    .map((res, idx) => (res.success ? idx : null))
    .filter((idx): idx is number => idx !== null);

  const successfulUserProfiles = successIndices.map((idx) => userProfiles[idx]);

  if (successfulUserProfiles.length > 0) {
    await prisma.notification.createMany({
      data: successfulUserProfiles.map((profile) => ({
        receiverId: profile?.user?.id,
        title: title || "Notification",
        content: body,
        senderId: adminAccount?.id,
        type: "Admin",
      })),
    });
  }

  const failedTokens = response.responses
    .map((res, idx) => (!res.success ? fcmTokens[idx] : null))
    .filter((token): token is string => token !== null);

  return {
    successCount: response.successCount,
    failureCount: response.failureCount,
    failedTokens,
  };
};

export const notificationServices = {
  getNotificationsFromDB,
  getSingleNotificationFromDB,
  markAllReadInDB,
};

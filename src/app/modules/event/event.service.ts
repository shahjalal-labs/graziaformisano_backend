import { TEventCategory } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import { calculateDistance } from "../../../helpers/distanceCalculator";
import {
  sendNotifications,
  sendSingleNotification,
} from "../notifications/notification.services";
import { canUseAccount } from "../../../helpers/subscriptionChecker";

const createEventInDB = async (userId: string, payload: any) => {
  await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  const res = await canUseAccount(userId);

  if (!res) {
    throw new ApiError(
      403,
      "Your 6-month trial has ended. Subscribe to keep using all features.",
    );
  }

  const { invitees, ...eventData } = payload;

  const event = await prisma.event.create({
    data: {
      ...eventData,
      userId,
    },
  });

  await prisma.eventRoom.create({
    data: {
      eventId: event.id,
    },
  });

  await prisma.userProfile.update({
    where: { userId },
    data: {
      hosted: { increment: 1 },
    },
  });
  if (payload.eventType === "Private" && payload.invitees?.length > 0) {
    await Promise.all(
      payload.invitees.map(async (invite: string) => {
        await sendPrivateEventJoinInvitation({
          userId: invite,
          eventId: event.id,
        });
      }),
    );
  }

  if (payload.eventType === "Public") {
    try {
      await sendNotifications(
        `${payload.eventName} è ora disponibile. Tocca per scoprire i dettagli e assicurarti un posto prima che si esaurisca.`,
        `🎉Nuovo Evento Creato!`,
        userId,
        event.id,
      );
    } catch (notificationError) {
      console.error("Notification failed:", notificationError);
    }
  }

  return;
};

const getAllEventsFromDB = async (
  userId: string,
  search?: string,
  city?: string,
  eventCategory?: TEventCategory,
  maxDistance?: number,
) => {
  const userLocation = await prisma.userLocation.findFirst({
    where: { userId },
  });

  if (!userLocation) {
    throw new ApiError(
      400,
      "User location not found. Please set your location to see nearby events",
    );
  }

  const events = await prisma.event.findMany({
    where: {
      // eventType: "Public",
      eventDate: {
        gte: new Date(),
      },

      // NOT: [userId ? { userId } : {}],
      ...(search && {
        OR: [
          { eventName: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(eventCategory && { eventCategory }),
      ...(city && {
        OR: [
          { city: { contains: city, mode: "insensitive" } },
          { address: { contains: city, mode: "insensitive" } },
        ],
      }),
    },
    select: {
      id: true,
      eventName: true,
      address: true,
      latitude: true,
      longitude: true,
      eventDate: true,
      eventTime: true,
      attendeesCount: true,
      maxAttendence: true,
      user: {
        select: {
          id: true,
          userName: true,
        },
      },
      eventAttendees: {
        where: { status: "Accepted" },
        select: {
          // status: true,
          user: {
            select: {
              id: true,
              profileImage: true,
            },
          },
        },
      },
    },
  });

  // Filter events based on maxDistance if provided
  if (maxDistance) {
    return events.filter((event) => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        event.latitude,
        event.longitude,
      );
      return distance <= maxDistance;
    });
  }

  return events;
};

const getMyEventsFromDB = async (
  userId: string,
  eventCategory?: TEventCategory,
  time?: string,
) => {
  const events = await prisma.event.findMany({
    where: {
      userId: userId,
      eventDate:
        time == "past"
          ? {
              lt: new Date(),
            }
          : {
              gte: new Date(),
            },
      ...(eventCategory && { eventCategory }),
    },
    orderBy: {
      eventDate: "desc",
    },
    select: {
      id: true,
      eventName: true,
      address: true,
      eventType: true,
      latitude: true,
      longitude: true,
      eventDate: true,
      eventTime: true,
      attendeesCount: true,
      maxAttendence: true,
      eventAttendees: {
        where: { status: "Accepted" },
        select: {
          user: {
            select: {
              id: true,
              profileImage: true,
            },
          },
        },
      },
    },
  });

  return events;
};

const editEventInDB = async (payload: any) => {
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: payload.eventId },
  });

  const res = await canUseAccount(event.userId);

  if (!res) {
    throw new ApiError(
      403,
      "Your 6-month trial has ended. Subscribe to keep using all features.",
    );
  }

  if (event.attendeesCount > payload.maxAttendence) {
    throw new ApiError(
      400,
      "Max attendees cannot be less than current attendees",
    );
  }

  await prisma.event.update({
    where: { id: payload.eventId },
    data: {
      eventDate: payload.eventDate || event.eventDate,
      eventTime: payload.eventTime || event.eventTime,
      maxAttendence: payload.maxAttendence || event.maxAttendence,
      description: payload.description || event.description,
      agenda: payload.agenda || event.agenda,
      address: payload.address || event.address,
      latitude: payload.latitude || event.latitude,
      longitude: payload.longitude || event.longitude,
      eventName: payload.eventName || event.eventName,
      eventCategory: payload.eventCategory || event.eventCategory,
      eventPlace: payload.eventPlace || event.eventPlace,
      eventType: payload.eventType || event.eventType,
    },
  });

  try {
    await sendNotifications(
      `L’evento ${event.eventName} ha aggiornamenti importanti. Controlla gli ultimi dettagli.`,
      `🔔Evento Aggiornato`,
      event.userId,
      event.id,
    );
  } catch (notificationError) {
    console.error("Notification failed:", notificationError);
  }

  return;
};

const deleteEventFromDB = async (eventId: string) => {
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
  });

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

const getUserWiseEventJoinHistoryFromDB = async (userId: string) => {
  const events = await prisma.eventAttendee.findMany({
    where: { userId },
    select: {
      id: true,
      status: true,
      event: {
        select: {
          id: true,
          eventName: true,
          address: true,
          latitude: true,
          longitude: true,
          eventDate: true,
          eventTime: true,
          attendeesCount: true,
          maxAttendence: true,
          user: {
            select: {
              id: true,
              userName: true,
            },
          },
          eventAttendees: {
            where: { status: "Accepted" },
            select: {
              user: {
                select: {
                  id: true,
                  profileImage: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return events;
};

const acceptOrRejectEventJoinRequestInDB = async (payload: any) => {
  const invite = await prisma.eventAttendee.findFirst({
    where: { id: payload.inviteId, status: "Pending" },
  });
  if (!invite) {
    throw new ApiError(400, "Invite not found or already responded");
  }

  const event = await prisma.event.findUniqueOrThrow({
    where: { id: invite.eventId },
  });

  const res = await canUseAccount(event.userId);

  if (!res) {
    throw new ApiError(
      403,
      "Your 6-month trial has ended. Subscribe to keep using all features.",
    );
  }

  if (event.attendeesCount >= event.maxAttendence) {
    throw new ApiError(400, "Event is full");
  }

  if (payload.accept === true) {
    await prisma.eventAttendee.update({
      where: { id: payload.inviteId },
      data: { status: "Accepted" },
    });

    await prisma.event.update({
      where: { id: invite.eventId },
      data: {
        attendeesCount: { increment: 1 },
      },
    });

    await prisma.userProfile.update({
      where: { userId: invite.userId },
      data: {
        attendance: { increment: 1 },
      },
    });

    return { message: "Event join request accepted" };
  }

  await prisma.eventAttendee.delete({
    where: { id: payload.inviteId },
  });
  return { message: "Event join request rejected" };
};

const getEventDetailsFromDB = async (eventId: string) => {
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
    select: {
      id: true,
      eventName: true,
      address: true,
      eventDate: true,
      eventTime: true,
      eventCategory: true,
      eventPlace: true,
      eventType: true,
      description: true,
      maxAttendence: true,
      attendeesCount: true,
      agenda: true,
      user: {
        select: {
          id: true,
          userName: true,
          profileImage: true,
          userProfile: {
            select: {
              profession: true,
            },
          },
        },
      },
      eventAttendees: {
        // where: { status: "Accepted" },
        select: {
          id: true,
          status: true,
          user: {
            select: {
              id: true,
              profileImage: true,
              userName: true,
              userProfile: {
                select: {
                  profession: true,
                  company: true,
                },
              },
            },
          },
        },
      },
    },
  });
  return event;
};

const joinEventInDB = async (userId: string, eventId: string) => {
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
  });
  await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  const res = await canUseAccount(userId);

  if (!res) {
    throw new ApiError(
      403,
      "Your 6-month trial has ended. Subscribe to keep using all features.",
    );
  }

  if (event.attendeesCount >= event.maxAttendence) {
    throw new ApiError(400, "Event is full");
  }

  if (event.userId === userId) {
    throw new ApiError(400, "You cannot join your own event");
  }

  if (event.eventType === "Private") {
    throw new ApiError(
      400,
      "This event is private. You cannot join this event",
    );
  }

  const existingAttendee = await prisma.eventAttendee.findFirst({
    where: { userId, eventId },
  });

  if (existingAttendee) {
    throw new ApiError(400, "You have already joined this event");
  }

  await prisma.eventAttendee.create({
    data: {
      userId,
      eventId,
    },
  });

  await prisma.event.update({
    where: { id: eventId },
    data: {
      attendeesCount: {
        increment: 1,
      },
    },
  });

  await prisma.userProfile.update({
    where: { userId },
    data: {
      attendance: { increment: 1 },
    },
  });

  return;
};

const sendPrivateEventJoinInvitation = async (payload: any) => {
  await prisma.user.findUniqueOrThrow({
    where: { id: payload.userId },
  });

  const event = await prisma.event.findUniqueOrThrow({
    where: { id: payload.eventId },
  });

  const existingAttendee = await prisma.eventAttendee.findFirst({
    where: { userId: payload.userId, eventId: payload.eventId },
  });

  if (existingAttendee) {
    throw new ApiError(400, "User is already invited or has joined this event");
  }

  if (event.attendeesCount >= event.maxAttendence) {
    throw new ApiError(400, "Event is full");
  }

  const res = await canUseAccount(event.userId);

  if (!res) {
    throw new ApiError(
      403,
      "Your 6-month trial has ended. Subscribe to keep using all features.",
    );
  }

  await prisma.eventAttendee.create({
    data: {
      userId: payload.userId,
      eventId: payload.eventId,
      status: "Pending",
    },
  });
  try {
    await sendSingleNotification(
      payload.userId,
      `Sei stato invitato a ${event.eventName}. Tocca per partecipare ora: posti limitati disponibili!`,
      event.userId,
      "🎉Invito a partecipare all’evento!",
      "Event",
      `${payload.eventId}`,
    );
  } catch (notificationError) {
    console.error("Notification failed:", notificationError);
  }

  return;
};

const getNonInvitedUsersForPrivateEvent = async (eventId: string) => {
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
  });

  const invitedUserIds = await prisma.eventAttendee.findMany({
    where: { eventId },
    select: { userId: true },
  });

  const invitedIds = invitedUserIds.map((attendee) => attendee.userId);
  const excludedIds = [event.userId, ...invitedIds];

  const nonInvitedUsers = await prisma.user.findMany({
    where: {
      role: { not: "ADMIN" },
      id: { notIn: excludedIds },
    },
    select: {
      id: true,
      userName: true,
      profileImage: true,
    },
  });

  return nonInvitedUsers;
};

const leaveEventInDB = async (userId: string, eventId: string) => {
  await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
  });
  const attendee = await prisma.eventAttendee.findFirst({
    where: { userId, eventId },
  });

  await prisma.eventAttendee.deleteMany({
    where: { userId, eventId },
  });

  if (attendee?.status === "Accepted") {
    await prisma.event.update({
      where: { id: eventId },
      data: {
        attendeesCount: {
          decrement: 1,
        },
      },
    });
  }

  return;
};

const getEventAndUserByLocation = async (
  userId: string,
  maxDistance?: number,
) => {
  const userLocation = await prisma.userLocation.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (!userLocation) {
    throw new ApiError(404, "User location not found");
  }

  const [events, users] = await Promise.all([
    prisma.event.findMany({
      where: {
        eventDate: {
          gte: new Date(),
        },
        OR: [
          {
            eventType: "Public",
          },
          {
            eventType: "Private",
            OR: [
              { userId },
              {
                eventAttendees: {
                  some: {
                    userId,
                  },
                },
              },
            ],
          },
        ],
      },
      // where: {
      //   eventDate: {
      //     gte: new Date(),
      //   },
      // },
      select: {
        id: true,
        eventName: true,
        address: true,
        eventDate: true,
        eventTime: true,
        attendeesCount: true,
        maxAttendence: true,
        latitude: true,
        longitude: true,
        user: {
          select: {
            userName: true,
            profileImage: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      where: {
        id: { not: userId },
        role: { not: "ADMIN" },
      },
      select: {
        id: true,
        userName: true,
        profileImage: true,
        userLocation: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            latitude: true,
            longitude: true,
          },
        },
      },
    }),
  ]);

  const nearbyEvents = events
    .map((event) => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        event.latitude,
        event.longitude,
      );

      return {
        type: "Event" as const,
        id: event.id,
        eventName: event.eventName,
        userName: event.user.userName,
        profileImage: event.user.profileImage,
        address: event.address,
        eventDate: event.eventDate,
        eventTime: event.eventTime,
        attendeesCount: event.attendeesCount,
        maxAttendence: event.maxAttendence,
        latitude: event.latitude,
        longitude: event.longitude,
        distance,
      };
    })
    .filter((item) => !maxDistance || item.distance <= maxDistance);

  
  const nearbyUsers = users
    .map((user) => {
      const location = user.userLocation[0];

      if (!location) {
        return null;
      }

      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        location.latitude,
        location.longitude,
      );

      return {
        type: "User" as const,
        id: user.id,
        eventName: null,
        userName: user.userName,
        profileImage: user.profileImage,
        latitude: location.latitude,
        longitude: location.longitude,
        distance,
      };
    })
    .filter(
      (item): item is NonNullable<typeof item> =>
        !!item && (!maxDistance || item.distance <= maxDistance),
    );

  return [...nearbyEvents, ...nearbyUsers]
    .sort((a, b) => a.distance - b.distance)
    .map(({ distance, ...item }) => item);
};

export const eventService = {
  createEventInDB,
  getAllEventsFromDB,
  joinEventInDB,
  getEventDetailsFromDB,
  getMyEventsFromDB,
  editEventInDB,
  deleteEventFromDB,
  sendPrivateEventJoinInvitation,
  getUserWiseEventJoinHistoryFromDB,
  acceptOrRejectEventJoinRequestInDB,
  getNonInvitedUsersForPrivateEvent,
  leaveEventInDB,
  getEventAndUserByLocation,
};

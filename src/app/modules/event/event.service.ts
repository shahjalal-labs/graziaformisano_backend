import { Event, TEventCategory } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import { calculateDistance } from "../../../helpers/distanceCalculator";
import { get } from "http";

const createEventInDB = async (userId: string, payload: Event) => {
  await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  await prisma.event.create({
    data: {
      ...payload,
      userId,
    },
  });

  return;
};

const getAllEventsFromDB = async (
  userId: string,
  search?: string,
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
      eventType: "Public",
      ...(search && {
        OR: [
          { eventName: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(eventCategory && { eventCategory }),
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
const getMyEventsFromDB = async (userId: string) => {
  const events = await prisma.event.findMany({
    where: {
      userId: userId,
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

  return;
};

const deleteEventFromDB = async (eventId: string) => {
  await prisma.event.delete({
    where: { id: eventId },
  });
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
  return event;
};

const joinEventInDB = async (userId: string, eventId: string) => {
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
  });
  await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

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

  return;
};

const sendPrivateEventJoinInvitation = async (payload: any) => {
  await prisma.user.findUniqueOrThrow({
    where: { id: payload.userId },
  });

  const event = await prisma.event.findUniqueOrThrow({
    where: { id: payload.eventId, eventType: "Private" },
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

  await prisma.eventAttendee.create({
    data: {
      userId: payload.userId,
      eventId: payload.eventId,
      status: "Pending",
    },
  });

  return;
};

const getNonInvitedUsersForPrivateEvent = async (eventId: string) => {
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: eventId, eventType: "Private" },
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
};

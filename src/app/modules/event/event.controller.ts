import e, { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { eventService } from "./event.service";
import sendResponse from "../../../shared/sendResponse";
import { TEventCategory } from "@prisma/client";

const createEvent = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  await eventService.createEventInDB(userId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Event created successfully",
  });
});
const getAllEvents = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const search = req.query.search as string | undefined;
  const city = req.query.city as string | undefined;
  const eventCategory = req.query.eventCategory as TEventCategory | undefined;
  const maxDistance = req.query.maxDistance
    ? Number(req.query.maxDistance)
    : undefined;
  const events = await eventService.getAllEventsFromDB(
    userId,
    search,
    city,
    eventCategory,
    maxDistance,
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Events retrieved successfully",
    data: events,
  });
});
const getMyEvents = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const events = await eventService.getMyEventsFromDB(userId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Events retrieved successfully",
    data: events,
  });
});
const eventDetails = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const eventId = req.params.id;
  const event = await eventService.getEventDetailsFromDB(eventId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Event details retrieved successfully",
    data: event,
  });
});
const userWiseJoinHistory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const events = await eventService.getUserWiseEventJoinHistoryFromDB(userId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Events retrieved successfully",
    data: events,
  });
});
const editEvent = catchAsync(async (req: Request, res: Response) => {
  await eventService.editEventInDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Event updated successfully",
  });
});
const deleteEvent = catchAsync(async (req: Request, res: Response) => {
  await eventService.deleteEventFromDB(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Event deleted successfully",
  });
});
const joinEvent = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const eventId = req.params.id;
  await eventService.joinEventInDB(userId, eventId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Event joined successfully",
  });
});
const sendInvitation = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  await eventService.sendPrivateEventJoinInvitation(payload);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Invitation sent successfully",
  });
});
const acceptOrRejectEventJoinRequest = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const result =
      await eventService.acceptOrRejectEventJoinRequestInDB(payload);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: result.message,
    });
  },
);
const nonInvitedUsers = catchAsync(async (req: Request, res: Response) => {
  const eventId = req.params.id;
  const result = await eventService.getNonInvitedUsersForPrivateEvent(eventId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Non-invited users retrieved successfully",
    data: result,
  });
});
const leaveEvent = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const eventId = req.params.id;
  await eventService.leaveEventInDB(userId, eventId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Event left successfully",
  });
});
const eventUserByLocation = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const maxDistance = Number(req.query.maxDistance);
  const events = await eventService.getEventAndUserByLocation(userId, maxDistance);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Event and user data retrieved successfully",
    data: events,
  });
});

export const eventController = {
  createEvent,
  getAllEvents,
  joinEvent,
  eventDetails,
  getMyEvents,
  editEvent,
  deleteEvent,
  sendInvitation,
  acceptOrRejectEventJoinRequest,
  userWiseJoinHistory,
  nonInvitedUsers,
  leaveEvent,
  eventUserByLocation,
};

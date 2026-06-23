import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { adminService } from "./admin.service";
import { TEventType } from "@prisma/client";

const loginAdmin = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await adminService.loginAdminIntoDB(payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin logged in successfully",
    data: result,
  });
});

const deletePost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await adminService.deletePostFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Post deleted successfully",
  });
});

const updateAdminProfile = catchAsync(async (req: Request, res: Response) => {
  await adminService.updateAdminProfileInDB(req);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin profile updated successfully",
  });
});
const allUsers = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const search = req.query.search as string;

  const result = await adminService.getAllUsersFromDB(page, search);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
});
const allPosts = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const result = await adminService.getAllPostsFromDB(page);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Posts retrieved successfully",
    data: result,
  });
});
const allEvents = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const search = req.query.search as string;
  const type = req.query.type as TEventType;

  const result = await adminService.getAllEventsFromDB(page, search, type);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All events retrieved successfully",
    data: result,
  });
});
const allSubscribers = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;

  const result = await adminService.getAllSubscribersFromDB(page);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All subscribers retrieved successfully",
    data: result,
  });
});
const allNotifications = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const result = await adminService.getAllAdminNotificationsFromDB(page);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All notifications retrieved successfully",
    data: result,
  });
});
const allSubscriber = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const result = await adminService.getSubscriptionFromDB(page, req.query.search as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All subscriptions retrieved successfully",
    data: result,
  });
});
const sendAdminNotifications = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  
  const result = await adminService.sendNotificationsToUsers(payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin notifications sent successfully",
    data: result,
  });
});
const freeAccess = catchAsync(async (req: Request, res: Response) => {
  await adminService.giveAccessToUserForFree(req.body.userId, req.body.date);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Free access granted successfully",
  });
});
const removeSubscription = catchAsync(async (req: Request, res: Response) => {
  await adminService.removeSubscriptionFromUser(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscription removed successfully",
  });
});
const userDetails = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const result = await adminService.getUserDetailsFromDB(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User details retrieved successfully",
    data: result,
  });
});
const eventDetails = catchAsync(async (req: Request, res: Response) => {
  const eventId = req.params.id;
  const result = await adminService.getEventDetailsFromDB(eventId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event details retrieved successfully",
    data: result,
  });
});
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  await adminService.deleteUserFromDB(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User deleted successfully",
  });
});
const deleteEvent = catchAsync(async (req: Request, res: Response) => {
  const eventId = req.params.id;
  await adminService.deleteEventFromDB(eventId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event deleted successfully",
  });
});
const getStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await adminService.getDashboardStatsFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Dashboard stats retrieved successfully",
    data: stats,
  });
});
const topProfessionals = catchAsync(async (req: Request, res: Response) => {
  const topProfessionals = await adminService.getTopProfessionalsFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Top professionals retrieved successfully",
    data: topProfessionals,
  });
});
const toggleUserStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const result = await adminService.toggleUserStatusIntoDB(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
  });
});
const allCompany = catchAsync(async (req: Request, res: Response) => {
  const company = await adminService.getAllCompanyFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All companies retrieved successfully",
    data: company,
  });
});

export const adminController = {
  allNotifications,
  allCompany,
  allSubscriber,
  loginAdmin,
  updateAdminProfile,
  allUsers,
  allEvents,
  eventDetails,
  userDetails,
  getStats,
  deleteUser,
  deleteEvent,
  allSubscribers,
  toggleUserStatus,
  topProfessionals,
  allPosts,
  deletePost,
  freeAccess,
  removeSubscription,
  sendAdminNotifications,
};

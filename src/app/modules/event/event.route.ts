import express from "express";
import auth from "../../middlewares/auth";
import { eventController } from "./event.controller";
import validateRequest from "../../middlewares/validateRequest";
import { eventSchema } from "./event.validation";

const router = express.Router();

router.post(
  "/create",
  auth(),
  validateRequest(eventSchema.eventValidationSchema),
  eventController.createEvent,
);
router.get(
  "/all",
  auth(),
  eventController.getAllEvents,
);
router.get(
  "/user-wise",
  auth(),
  eventController.getMyEvents,
);
router.put(
  "/update",
  auth(),
  validateRequest(eventSchema.eventUpdateValidationSchema),
  eventController.editEvent,
);
router.delete(
  "/delete/:id",
  auth(),
  eventController.deleteEvent,
);
router.get(
  "/details/:id",
  auth(),
  eventController.eventDetails,
);
router.get(
  "/join-history",
  auth(),
  eventController.userWiseJoinHistory,
);
router.patch(
  "/join/:id",
  auth(),
  eventController.joinEvent,
);
router.post(
  "/invite",
  auth(),
  validateRequest(eventSchema.sendInviteSchema),
  eventController.sendInvitation,
);
router.put(
  "/accept-reject-invite",
  auth(),
  validateRequest(eventSchema.acceptOrRejectInviteSchema),
  eventController.acceptOrRejectEventJoinRequest,
);
router.get(
  "/non-invited-users/:id",
  auth(),
  eventController.nonInvitedUsers,
);

export const eventRoutes = router;

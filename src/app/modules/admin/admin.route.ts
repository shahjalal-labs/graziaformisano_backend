import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { authValidation } from "../auth/auth.validation";
import { adminController } from "./admin.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../../helpers/fileUploadHelper";
import { parseBodyData } from "../../middlewares/parseBodyData";

const router = express.Router();

//login user
router.post(
  "/login",
  validateRequest(authValidation.loginSchema),
  adminController.loginAdmin,
);
router.put(
  "/update-profile",
  auth(UserRole.ADMIN),
  fileUploader.profileImage,
  parseBodyData,
  adminController.updateAdminProfile,
);

router.get("/users", auth(UserRole.ADMIN), adminController.allUsers);
router.get("/posts", auth(UserRole.ADMIN), adminController.allPosts);
router.delete("/posts/:id", auth(), adminController.deletePost);
router.patch("/users/status/:id", auth(UserRole.ADMIN), adminController.toggleUserStatus);
router.get(
  "/top-professionals",
  auth(UserRole.ADMIN),
  adminController.topProfessionals,
);
router.get("/events", auth(UserRole.ADMIN), adminController.allEvents);
router.get(
  "/subscribers",
  auth(UserRole.ADMIN),
  adminController.allSubscribers,
);
router.get(
  "/subscriber",
  auth(UserRole.ADMIN),
  adminController.allSubscriber,
);
router.get("/overview", auth(UserRole.ADMIN), adminController.getStats);
router.get("/events/:id", auth(UserRole.ADMIN), adminController.eventDetails);
router.get("/users/:id", auth(UserRole.ADMIN), adminController.userDetails);
router.delete("/delete/:id", auth(UserRole.ADMIN), adminController.deleteUser);
router.delete(
  "/delete-event/:id",
  auth(UserRole.ADMIN),
  adminController.deleteEvent,
);

export const adminRoute = router;

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
router.get("/events", auth(UserRole.ADMIN), adminController.allEvents);
router.get("/events/:id", auth(UserRole.ADMIN), adminController.eventDetails);
router.get("/users/:id", auth(UserRole.ADMIN), adminController.userDetails);
router.patch("/delete/:id", auth(UserRole.ADMIN), adminController.deleteUser);
router.delete("/delete-event/:id", auth(UserRole.ADMIN), adminController.deleteEvent);

export const adminRoute = router;

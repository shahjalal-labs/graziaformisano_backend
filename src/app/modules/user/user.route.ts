import express from "express";
import { UserControllers } from "./user.controller";
import validateRequest from "../../middlewares/validateRequest";
import { userValidation } from "./user.validation";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import { parseBodyData } from "../../middlewares/parseBodyData";
import { fileUploader } from "../../../helpers/fileUploadHelper";

const router = express.Router();

router.post(
  "/pending",
  validateRequest(userValidation.userRegisterValidationSchema),
  UserControllers.createPendingUser,
);
router.post("/verify-account", UserControllers.createUser);
router.post(
  "/set-profile",
  auth(UserRole.USER),
  fileUploader.profileImage,
  parseBodyData,
  UserControllers.setUpUserProfile,
);
router.put(
  "/update-profile",
  auth(UserRole.USER),
  UserControllers.updateUserProfile,
);
router.put(
  "/update-profile-image",
  auth(UserRole.USER),
  fileUploader.profileImage,
  parseBodyData,
  UserControllers.updateProfileImage,
);
router.get("/profile", auth(), UserControllers.getProfile);
router.delete("/delete-account", auth(), UserControllers.deleteUser);

router.post(
  "/generate-url",
  fileUploader.uploadMultiple,
  UserControllers.generateFileUrl,
);
router.get("/all", auth(), UserControllers.getUsers);
router.get("/details/:id", auth(), UserControllers.userDetails);

export const userRoutes = router;

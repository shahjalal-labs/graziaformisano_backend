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
  "/set-profile/user",
  auth(UserRole.USER),
  fileUploader.profileImage,
  parseBodyData,
  UserControllers.updateUserProfile,
);

router.get("/profile", auth(), UserControllers.getProfile);
router.put(
  "/:id",
  validateRequest(userValidation.userUpdateValidationSchema),
  auth(UserRole.ADMIN),
  UserControllers.updateUser,
);
router.delete("/:id", auth(UserRole.ADMIN), UserControllers.deleteUser);

export const userRoutes = router;

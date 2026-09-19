import express from "express";
import { authController } from "./auth.controller";
import validateRequest from "../../middlewares/validateRequest";
import { authValidation } from "./auth.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

//login user
router.post(
  "/login",
  validateRequest(authValidation.loginSchema),
  authController.loginUser,
);
//login user
router.post("/logout", auth(), authController.logout);
router.post("/social-login", authController.authLogin);
router.post(
  "/update/user-location",
  auth(),
  validateRequest(authValidation.userLocationSchema),
  authController.updateUserLocation,
);
router.post("/send-otp", authController.sendForgotPasswordOtp);
router.post("/verify-otp", authController.verifyForgotPasswordOtpCode);
router.patch("/reset-password", auth(), authController.resetPassword);
router.patch("/change-password", auth(), authController.changePassword);
router.put("/block-unblock-user", auth(), authController.blockUnblockUser);

export const authRoute = router;

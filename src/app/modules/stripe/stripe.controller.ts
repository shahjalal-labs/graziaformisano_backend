import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { Request, Response } from "express";
import { stripeService } from "./stripe.service";

const getAllSubscriptionPlan = catchAsync(
  async (req: Request, res: Response) => {
    const result = await stripeService.getAllSubscriptionPlanIntoDB();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Subscription plan retrieved successfully",
      data: result,
    });
  },
);

export const stripeController = {
  getAllSubscriptionPlan,
};

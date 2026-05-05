import { Router } from "express";
import { stripeController } from "./stripe.controller";

const router = Router();

router.get("/get-subscription-plans", stripeController.getAllSubscriptionPlan);

export const stripeRoutes = router;

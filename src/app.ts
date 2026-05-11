import express, { Application, NextFunction, Request, Response } from "express";

import httpStatus from "http-status";
import cors from "cors";
import router from "./app/routes";
import GlobalErrorHandler from "./app/middlewares/globalErrorHandler";
import { PrismaClient } from "@prisma/client";
import path from "path";
import redisClient from "./helpers/redis";
import { accountDelete, childPolicy, dataDelete, privacyPolicy, termsandconditions } from "./app/routes/view.route";
import { RevenueController } from "./app/modules/stripe/subscription.webhook";

const app: Application = express();
const prisma = new PrismaClient();

// Middleware setup
// prisma
//   .$connect()
//   .then(() => {
//     console.log("Database connected successfully!");
//   })
//   .catch((error) => {
//     console.error("Failed to connect to the database:", error);
//   });
(async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully!");
    await redisClient.connect();
  } catch (error) {
    console.error("Failed to connect to services:", error);
    process.exit(1); // exit app if connection fails
  }
})();

app.use(cors());


app.post(
  "/webhook/revenuecat",
  express.raw({ type: "application/json" }),
  RevenueController.handleWebhook,
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/", (req: Request, res: Response) => {
  res.send({
    Message: "Welcome to api main route",
  });
});

app.use("/api/v1", router);


app.get("/privacy-policy", (req, res) => {
  res.send(privacyPolicy());
});
app.get("/terms-and-conditions", (req, res) => {
  res.send(termsandconditions());
});

app.get("/data-delete", (req, res) => {
  res.send(dataDelete());
});
app.get("/child-policy", (req, res) => {
  res.send(childPolicy());
});

app.get("/account-delete", (req, res) => {
  res.send(accountDelete());
});

app.use(GlobalErrorHandler);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;

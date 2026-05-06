import { Request, Response } from "express";
import config from "../../../config";
import { processEvent } from "./revenuecat.service";

const handleWebhook = async (req: Request, res: Response) => {  
  try {
    const authHeader = req.headers.authorization;
    const auth = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (
      !config.revenueCat.revenueCatHeader ||
      auth !== config.revenueCat.revenueCatHeader
    ) {
      return res.status(403).send("Forbidden");
    }

    let payload;
    try {
      payload = JSON.parse(
        Buffer.isBuffer(req.body)
          ? req.body.toString("utf8")
          : String(req.body),
      );
    } catch {
      return res.status(400).send("Invalid JSON");
    }
    console.log(payload, "paydlaodisfsdf");

    try {
      await processEvent(payload.event);
    } catch (err) {
      console.error("Webhook logic error", err);
    }

    return res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook fatal error", err);
    return res.status(200).send("OK");
  }
};

export const RevenueController = {
  handleWebhook,
};

import { handleExpiry, initialPurchaseOrRenew } from "./revenuecat.handlers";

export async function processEvent(event: any) {
  try {
    if (!event || typeof event.type !== "string") {
      console.warn("Invalid RevenueCat event", event);
      return;
    }

    const type = event.type;

    switch (type) {
      case "INITIAL_PURCHASE":
      case "RENEWAL":
        await initialPurchaseOrRenew(event);
        break;

      case "EXPIRATION":
        await handleExpiry(event);
        break;

      default:
        console.log("Unhandled RevenueCat event:", type);
    }
  } catch (err) {
    //CRITICAL: swallow error, do not rethrow
    console.error("processEvent failed:", {
      type: event?.type,
      error: err,
    });
  }
}

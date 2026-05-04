import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";

export async function initialPurchaseOrRenew(event: any) {
  try {
    const {
      id: eventId,
      store,
      app_user_id: userId,
      expiration_at_ms,
      original_transaction_id,
      product_id,
      price,
      renewal_number,
      transaction_id,
    } = event;

    console.log("RevenueCat initial purchase/renewal event received", {
      eventId,
      userId,
      original_transaction_id,
      store,
      product_id,
    });

    // Validate required fields
    if (!userId || !product_id || !original_transaction_id) {
      throw new ApiError(
        400,
        "Missing required fields: userId, product_id, or original_transaction_id",
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, `User with ID ${userId} not found`);
    }

    // Convert expiration_at_ms to DateTime (milliseconds to seconds)
    const expiresAt = expiration_at_ms
      ? new Date(expiration_at_ms)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days

    // Upsert UserSubscription
    const userSubscription = await prisma.userSubscription.upsert({
      where: { userId },
      create: {
        userId,
        productId: product_id,      
        store: store || "unknown",
        originaltransactionId: original_transaction_id,
        renewal_number: renewal_number || 0,
        expiresAt,
        status: "ACTIVE",
      },
      update: {
        productId: product_id,
        store: store || "unknown",
        originaltransactionId: original_transaction_id,
        renewal_number: renewal_number || 0,
        expiresAt,
        status: "ACTIVE",
      },
    });

    // Update user subscription status
    await prisma.user.update({
      where: { id: userId },
      data: { isSubscribed: true },
    });

    console.log(`✅ Subscription activated for user ${userId}`, {
      expiresAt,
      productId: product_id,
    });

    return {
      handled: true,
      type: event?.type,
      subscriptionId: userSubscription.id,
    };
  } catch (err) {
    console.error("❌ initialPurchaseOrRenew failed:", {
      type: event?.type,
      error: err instanceof Error ? err.message : err,
    });
    throw err;
  }
}

export async function handleExpiry(event: any) {
  try {
    const {
      id: eventId,
      app_user_id: userId,
      original_transaction_id,
      product_id,
    } = event;

    console.log("RevenueCat expiration event received", {
      eventId,
      userId,
      original_transaction_id,
      product_id,
    });

    // Validate required fields
    if (!userId) {
      throw new ApiError(400, "Missing required field: app_user_id (userId)");
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, `User with ID ${userId} not found`);
    }

    // Update UserSubscription status to DEACTIVE
    const userSubscription = await prisma.userSubscription.findUnique({
      where: { userId },
    });

    if (userSubscription) {
      await prisma.userSubscription.update({
        where: { userId },
        data: { status: "DEACTIVE" },
      });
    }

    // Update user subscription status
    await prisma.user.update({
      where: { id: userId },
      data: { isSubscribed: false },
    });

    console.log(`✅ Subscription deactivated for user ${userId}`);

    return {
      handled: true,
      type: event?.type,
    };
  } catch (err) {
    console.error("❌ handleExpiry failed:", {
      type: event?.type,
      error: err instanceof Error ? err.message : err,
    });
    throw err;
  }
}

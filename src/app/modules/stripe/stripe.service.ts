import Stripe from "stripe";
import ApiError from "../../../errors/ApiErrors";
import config from "../../../config";
import prisma from "../../../shared/prisma";
import { SubscriptionType } from "@prisma/client";
const stripe = new Stripe(config.stripe.stripe_secret as string);

const createMonthlySubscriptionPlan = async () => {
  const title = "Monthly Subscription";
  const subscriptionTitleType = "MONTHLY";
  const amount = 4.99;
  const interval = "month";
  const features = [
    "Create unlimited events",
    "Join and highlight events",
    "Add unlimited users to your network",
    "Unlimited private chat",
  ];

  const italian = [
    "Crea eventi illimitati",
    "Partecipa e evidenzia eventi",
    "Aggiungi utenti illimitati alla tua rete",
    "Chat privata illimitata",
  ];

  const existing = await prisma.subscription.findUnique({
    where: { subscriptionTitleType },
  });

  if (existing) {
    console.log("Subscription already exists");
    return;
  }

  const result = await prisma.subscription.create({
    data: {
      title,
      subscriptionTitleType,
      price: amount,
      features,
      italianFeatures: italian,
      type: SubscriptionType.SUBSCRIPTION,
      interval,
    },
  });

  console.log("Monthly subscription created successfully.");

  return result;
};
const createYearlySubscriptionPlan = async () => {
  const title = "Yearly Subscription";
  const subscriptionTitleType = "YEARLY";
  const amount = 49.99;
  const interval = "year";
  const features = [
    "Discounted price as a reward for your loyalty",
    "Create unlimited events",
    "Join and highlight events",
    "Add unlimited users to your network",
    "Unlimited private chat",
    "Continue Free",
  ];

  const italian = [
    "Prezzo scontato come premio per la tua fiducia",
    "Crea eventi illimitati",
    "Partecipa e evidenzia eventi",
    "Aggiungi utenti illimitati alla tua rete",
    "Chat privata illimitata",
    "Continua Gratis",
  ];

  const existing = await prisma.subscription.findUnique({
    where: { subscriptionTitleType },
  });

  if (existing) {
    console.log("Subscription already exists");
    return;
  }

  const result = await prisma.subscription.create({
    data: {
      title,
      subscriptionTitleType,
      price: amount,
      features,
      italianFeatures: italian,
      type: SubscriptionType.SUBSCRIPTION,
      interval,
    },
  });

  console.log("Yearly subscription created successfully.");

  return result;
};

const getAllSubscriptionPlanIntoDB = async () => {
  const products = await prisma.subscription.findMany({
    select: {
      id: true,
      title: true,
      price: true,
      subscriptionTitleType: true,
      interval: true,
      type: true,
      features: true,
      italianFeatures: true,
    },
  });

  return products;
};

export const stripeService = {
  createMonthlySubscriptionPlan,
  createYearlySubscriptionPlan,
  getAllSubscriptionPlanIntoDB,
};

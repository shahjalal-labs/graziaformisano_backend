import { z } from "zod";

const TEventType = z.enum(["Public", "Private"]);
const TEventPlace = z.enum(["Meeting", "Remote"]);
const TEventCategory = z.enum(["Lunch", "Dinner", "Breakfast", "Meeting"]);

const eventValidationSchema = z.object({
  eventName: z.string(),
  eventType: TEventType,
  eventCategory: TEventCategory,
  eventPlace: TEventPlace,
  //   eventDate: z.date(),
  eventTime: z.string(),
  description: z.string().optional(),
  // agenda: z.array(z.string()).min(1, "Agenda cannot be empty"), 
  maxAttendence: z.number().min(1, "Max attendees must be at least 1"),
  latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  address: z.string().optional(),
});
const eventUpdateValidationSchema = z.object({
  eventId: z.string(),
  eventName: z.string(),
  eventType: TEventType.optional(),
  eventCategory: TEventCategory.optional(),
  eventPlace: TEventPlace.optional(),
  //   eventDate: z.date(),
  eventTime: z.string().optional(),
  description: z.string().optional(),
  // agenda: z.array(z.string()).min(1, "Agenda cannot be empty").optional(), 
  maxAttendence: z
    .number()
    .min(1, "Max attendees must be at least 1")
    .optional(),
  latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .optional(),
  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .optional(),
  address: z.string().min(1, "Address cannot be empty").optional(),
});
const sendInviteSchema = z.object({
  eventId: z.string(),
  userId: z.string(),
});
const acceptOrRejectInviteSchema = z.object({
  inviteId: z.string(),
  accept: z.boolean(),
});

export const eventSchema = {
  eventValidationSchema,
  eventUpdateValidationSchema,
  sendInviteSchema,
  acceptOrRejectInviteSchema
};

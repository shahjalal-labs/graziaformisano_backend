import { z } from "zod";
const genderEnum = z.enum(["Male", "Female", "Other"]);

const userRegisterValidationSchema = z.object({
  userName: z.string().min(1, "User name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const userUpdateValidationSchema = z.object({
  userName: z.string().min(1, "User name is required").optional(),
  phone: z.string().min(8, "Phone number at least 8 digit long").optional(),
  gender: genderEnum.optional(),
});



const workerProfileSchema = z.object({
  gender: genderEnum,
  ethnicity: z.string(),
  disability: z.boolean(),
  bio: z.string().min(1, "Bio is required"),
  skills: z.array(z.string().min(1)).min(1, "At least one skill is required"),
  language: z.string().min(1, "Language is required"),
  experience: z.string().min(1, "Experience is required"),
  licenceNumber: z.string().min(1, "Licence number is required"),
});

export const userValidation = {
  userRegisterValidationSchema,
  userUpdateValidationSchema,
  workerProfileSchema,
};

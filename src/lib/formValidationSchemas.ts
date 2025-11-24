import { z } from "zod";

export const buildingSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(3, { message: "Buildingname must be atleast 3 characters long!" }),
    isActive: z.enum(["yes","no"],{message: "Status is required!"}).optional(),
});

export type BuildingSchema = z.infer<typeof buildingSchema>;

export const userSchema = z.object({
  id: z.string().optional(),
  email: z.string().email({ message: "Invalid email address!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .regex(/[A-Z]/, { message: "Password must contain an uppercase letter!" })
    .regex(/[a-z]/, { message: "Password must contain a lowercase letter!" })
    .regex(/[0-9]/, { message: "Password must contain a number!" })
    .regex(/[^A-Za-z0-9]/, {
      message: "Password must contain a special character!",
    })
    .optional(),

  firstName: z.string().min(1, { message: "First name is required!" }),
  lastName: z.string().min(1, { message: "Last name is required!" }),

  role: z.enum(["ADMINISTRATOR", "TECHNICIAN"], {
    message: "Role must be ADMINISTRATOR or TECHNICIAN",
  }),

  isActive: z.enum(["yes", "no"], { message: "Status is required!" }),
});

export const createUserSchema = userSchema.extend({
  password: z
    .string()
    .min(8, { message: "Password is required when creating a user!" })
    .regex(/[A-Z]/, { message: "Password must contain an uppercase letter!" })
    .regex(/[a-z]/, { message: "Password must contain a lowercase letter!" })
    .regex(/[0-9]/, { message: "Password must contain a number!" })
    .regex(/[^A-Za-z0-9]/, {
      message: "Password must contain a special character!",
    }),
});


export type UserSchema = z.infer<typeof userSchema>;

export const createInspectionSchema = z.object({
  id: z.string().optional(),
  date: z.string().min(1, { message: "Please select an inspection date." }),

  technicianId: z
    .string()
    .min(1, { message: "Please select a technician." }),

  buildingId: z.string().min(1, { message: "Please select a building." }),

  notes: z
    .string()
    .max(500, "Notes must be 500 characters or less.")
    .optional()
    .or(z.literal("")), 
});

export type CreateInspectionSchema = z.infer<typeof createInspectionSchema>;

export const dataCategorySchema = z.object({
  name: z.string(),
  type: z.enum(["NUMBER", "ON_OFF"]), 
  buildingId: z.string(),
});

export type DataCategorySchema = z.infer<typeof dataCategorySchema>;

export const saveReadingSchema = z.object({
  inspectionId: z.string(),
  categoryId: z.string(),
  numericalValue: z
    .preprocess((val) => (val === "" || val === null ? null : Number(val)), z.number().nullable())
    .optional(),
  booleanValue: z.boolean().nullable().optional(),
});

export type SaveReadingSchema = z.infer<typeof saveReadingSchema>;
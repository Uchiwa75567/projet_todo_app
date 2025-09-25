import { z } from "zod";
import { ErreurMessages } from "../utils/errorsMessage.js";

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(3, "Le titre doit contenir au moins 3 caractères")
    .max(255, "Le titre ne doit pas dépasser 255 caractères"),

  description: z
    .string()
    .max(200, ErreurMessages.descriptionTooLong)
    .optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(3, "Le titre doit contenir au moins 3 caractères")
    .max(255, "Le titre ne doit pas dépasser 255 caractères")
    .optional(),

  description: z
    .string()
    .max(200, ErreurMessages.descriptionTooLong)
    .optional(),

  completed: z.boolean().optional(),
});

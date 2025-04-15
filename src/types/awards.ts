import { z } from "zod";

export const achievementSchema = z.object({
  id: z.string(),
  title: z.string().min(1, { message: "Title is required" }),
  imageSrc: z.string().min(1, { message: "Image is required" }),
  imageAlt: z.string().min(1, { message: "Alt text is required" }),
  order_number: z.number().optional()
});

export const awardsContentSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: "Page title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  achievements: z.array(achievementSchema)
});

export type Achievement = z.infer<typeof achievementSchema>;
export type AwardsContent = z.infer<typeof awardsContentSchema>;

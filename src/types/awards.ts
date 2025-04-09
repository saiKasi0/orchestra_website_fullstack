import { z } from "zod";

export const achievementSchema = z.object({
  id: z.string(),
  title: z.string(),
  imageSrc: z.string(),
  imageAlt: z.string(),
  order_number: z.number().optional()
});

export const awardsContentSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  achievements: z.array(achievementSchema)
});

export type Achievement = z.infer<typeof achievementSchema>;
export type AwardsContent = z.infer<typeof awardsContentSchema>;

import { z } from "zod";

// Schema for individual competition
const competitionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  image: z.string().optional(),
  categories: z.array(z.string()),
  additionalInfo: z.string().optional()
});

// Schema for the entire competitions page content
export const competitionsContentSchema = z.object({
  title: z.string().min(1, "Page title is required"),
  description: z.string(),
  competitions: z.array(competitionSchema)
});

export type CompetitionSchema = z.infer<typeof competitionSchema>;
export type CompetitionsContent = z.infer<typeof competitionsContentSchema>;

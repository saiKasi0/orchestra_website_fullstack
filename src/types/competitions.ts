import { z } from "zod";

// Schema for individual competition
const competitionSchema = z.object({
  // Database ID - optional because it doesn't exist before creation
  id: z.number().int().positive().optional(), 
  // Temporary client-side ID for managing state before saving
  clientId: z.string().optional(), 
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  image: z.string().optional().nullable(), // Allow null as well if DB can store it
  categories: z.array(z.string()),
  additionalInfo: z.string().optional().nullable() // Allow null as well
});

// Schema for the entire competitions page content
export const competitionsContentSchema = z.object({
  title: z.string().min(1, "Page title is required"),
  description: z.string(),
  competitions: z.array(competitionSchema)
});

// Ensure CompetitionSchema type reflects the changes
export type CompetitionSchema = z.infer<typeof competitionSchema>; 
export type CompetitionsContent = z.infer<typeof competitionsContentSchema>;

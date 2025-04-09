import { z } from "zod";

// Schema for individual songs
export const songSchema = z.string().min(1, "Song title is required");

// Schema for orchestra groups
export const orchestraSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Orchestra name is required"),
  songs: z.array(songSchema)
});

// Complete concerts content schema
export const concertsContentSchema = z.object({
  id: z.string().optional(),
  concert_name: z.string().min(1, "Concert name is required"),
  poster_image_url: z.string().optional(),
  no_concert_text: z.string().optional().default("No concert order is available at this time. Please check back later."),
  orchestras: z.array(orchestraSchema)
});

// Types based on the schemas
export type Song = z.infer<typeof songSchema>;
export type Orchestra = z.infer<typeof orchestraSchema>;
export type ConcertsContent = z.infer<typeof concertsContentSchema>;

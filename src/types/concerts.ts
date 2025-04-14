import { z } from "zod";

// Schema for individual songs
export const songSchema = z.string()
  .min(1, "Song title cannot be empty")
  .transform(val => val.trim())
  .refine(val => val.length > 0, "Song title must contain at least one character after trimming");

// Schema for orchestra groups
export const orchestraSchema = z.object({
  // Use group_id as the identifier to match database schema
  id: z.string({
    required_error: "Orchestra ID is required",
    invalid_type_error: "Orchestra ID must be a string"
  }),
  name: z.string({
    required_error: "Orchestra name is required", 
    invalid_type_error: "Orchestra name must be a string"
  })
    .min(1, "Orchestra name cannot be empty")
    .transform(val => val.trim())
    .refine(val => val.length > 0, "Orchestra name must contain at least one character after trimming"),
  songs: z.array(songSchema).default([])
    .refine(songs => songs.length > 0, "At least one song is required per orchestra")
});

// Complete concerts content schema
export const concertsContentSchema = z.object({
  // Change the id field to a number or make it optional for create operations
  id: z.number().optional(), // Optional for creation, DB will auto-generate
  
  concert_name: z.string({
    required_error: "Concert name is required",
    invalid_type_error: "Concert name must be a string"
  })
    .min(1, "Concert name cannot be empty")
    .transform(val => val.trim())
    .refine(val => val.length > 0, "Concert name must contain at least one character after trimming"),
  
  poster_image_url: z.string({
    invalid_type_error: "Poster image URL must be a string"
  }).nullable().optional(),
  
  no_concert_text: z.string({
    invalid_type_error: "No concert text must be a string"
  })
    .nullable()
    .optional()
    .default("No concert order is available at this time. Please check back later."),
  
  orchestras: z.array(orchestraSchema)
    .optional()
    .default([])
});

// Types based on the schemas
export type Song = z.infer<typeof songSchema>;
export type Orchestra = z.infer<typeof orchestraSchema>;
export type ConcertsContent = z.infer<typeof concertsContentSchema>;

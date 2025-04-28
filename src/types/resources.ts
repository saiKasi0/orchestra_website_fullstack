import { z } from "zod";

// Resources content schema
export const resourcesContentSchema = z.object({
  // id is removed - will always be 1 on the server
  calendar_url: z.string().url("Invalid URL format").or(z.literal("")).nullable().optional(),
  support_title: z.string().min(1, "Support title cannot be empty").nullable().optional(),
  youtube_url: z.string().url("Invalid URL format").or(z.literal("")).nullable().optional(),
});

// TypeScript type derived from Zod schema
export type ResourcesContent = z.infer<typeof resourcesContentSchema>;
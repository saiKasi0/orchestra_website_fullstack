import { z } from "zod";

// Resources content schema
export const resourcesContentSchema = z.object({
  calendar_url: z.string(),
  support_title: z.string(),
  youtube_url: z.string(),
});

// TypeScript type derived from Zod schema
export type ResourcesContent = z.infer<typeof resourcesContentSchema>;
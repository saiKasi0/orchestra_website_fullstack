import { z } from "zod";

// Define the schema for gallery images
const galleryImageSchema = z.object({
  id: z.string(),
  src: z.string(),
  order_number: z.number().optional()
});

// Define the schema for feature items
const featureItemSchema = z.object({
  id: z.string(),
  icon: z.enum(["MusicNote", "MapPin", "Users"]),
  title: z.string(),
  description: z.string(),
  order_number: z.number().optional()
});

// Define the schema for the entire trips content
export const tripsContentSchema = z.object({
  id: z.string().optional(),
  page_title: z.string(),
  page_subtitle: z.string(),
  quote: z.string(),
  gallery_images: z.array(galleryImageSchema),
  feature_items: z.array(featureItemSchema)
});

export type TripsContent = z.infer<typeof tripsContentSchema>;
export type GalleryImage = z.infer<typeof galleryImageSchema>;
export type FeatureItem = z.infer<typeof featureItemSchema>;

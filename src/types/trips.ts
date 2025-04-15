import { z } from "zod";

// Define the schema for gallery images
const galleryImageSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(), // Allow number (from DB) or string (temp frontend), optional
  src: z.string().min(1, "Image source cannot be empty"),
  order_number: z.number().optional()
});

// Define the schema for feature items
const featureItemSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(), // Allow number (from DB) or string (temp frontend), optional
  icon: z.enum(["MusicNote", "MapPin", "Users"]),
  title: z.string().min(1, "Feature title cannot be empty"),
  description: z.string().min(1, "Feature description cannot be empty"),
  order_number: z.number().optional()
});

// Define the schema for the entire trips content for PUT requests (validation)
export const tripsContentSchema = z.object({
  id: z.number().optional(), // ID is number (always 1)
  page_title: z.string().min(1, "Page title cannot be empty"),
  page_subtitle: z.string().min(1, "Page subtitle cannot be empty"),
  quote: z.string().optional(), // Quote can be optional
  gallery_images: z.array(galleryImageSchema).optional().default([]),
  feature_items: z.array(featureItemSchema).optional().default([])
});

// Type for data structure used in the application (can be partially empty)
export type TripsContent = {
  id?: number | null; // ID is number
  page_title: string;
  page_subtitle: string;
  quote: string;
  gallery_images: GalleryImage[];
  feature_items: FeatureItem[];
};

// Update inferred types to reflect potential string/number ID
export type GalleryImage = Omit<z.infer<typeof galleryImageSchema>, 'id'> & {
  id?: number | string; // Explicitly allow number or string
};
export type FeatureItem = Omit<z.infer<typeof featureItemSchema>, 'id'> & {
  id?: number | string; // Explicitly allow number or string
};

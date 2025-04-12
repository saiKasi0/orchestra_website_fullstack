import { z } from "zod";

// Event card schema
export const eventCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  link_text: z.string(),
  link_url: z.string(),
});

// Staff member schema
export const staffMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  position: z.string(),
  image_url: z.string(),
  bio: z.string(),
});

// Leadership member schema
export const leadershipMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  image_url: z.string(),
});

// Leadership section schema
export const leadershipSectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().default("#3b82f6"), // Default blue color
  members: z.array(leadershipMemberSchema),
});

// Complete homepage content schema
export const homepageContentSchema = z.object({
  hero_image_url: z.string().optional(),
  hero_title: z.string().min(1, "Hero title is required"),
  hero_subtitle: z.string(),
  about_title: z.string(),
  about_description: z.string(),
  featured_events_title: z.string(),
  stats_students: z.string(),
  stats_performances: z.string(),
  stats_years: z.string(),
  staff_leadership_title: z.string(),
  event_cards: z.array(eventCardSchema),
  staff_members: z.array(staffMemberSchema),
  leadership_sections: z.array(leadershipSectionSchema),
});

// TypeScript types derived from Zod schemas
export type EventCard = z.infer<typeof eventCardSchema>;
export type StaffMember = z.infer<typeof staffMemberSchema>;
export type LeadershipMember = z.infer<typeof leadershipMemberSchema>;
export type LeadershipSection = z.infer<typeof leadershipSectionSchema>;
export type HomepageContent = z.infer<typeof homepageContentSchema>;
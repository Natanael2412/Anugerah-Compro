import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  client: z.string().optional().nullable(),
  role: z.string().min(1, "Role is required"),
  description: z.string().max(500, "Description maximum is 500 characters").optional().nullable(),
  tech_stack: z.array(z.string()).default([]),
  live_url: z.string().url().optional().nullable().or(z.literal("")),
  year: z.number().int().min(2000).max(2099),
  hero_image_url: z.string().optional().nullable(),
  gallery_urls: z.array(z.string()).default([]),
  is_av_published: z.boolean().default(false),
  is_personal_published: z.boolean().default(false),
  is_av_featured: z.boolean().default(false),
  is_personal_featured: z.boolean().default(false),
  project_status: z.enum(['public', 'nda', 'concept']).default('public'),
});

export type ProjectInsert = z.infer<typeof projectSchema>;

export interface Project extends ProjectInsert {
  id: string;
  created_at?: string;
  sort_order?: number;
  /** Index used for decorative Citadel numbering */
  index?: number;
}

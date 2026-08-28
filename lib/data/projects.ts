import { createClient } from "@/lib/supabase/server";
import type { TiptapDoc } from "./articles";

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: string;
  year: number;
  description: string;
  tags: string[];
  /** Index used for decorative Citadel numbering */
  index?: number;
  hero_image_url?: string;
  gallery_urls?: string[];
  content_json?: TiptapDoc;
  is_av_published: boolean;
  is_personal_published?: boolean;
}

/**
 * Fetches ALL projects for Admin Dashboard (includes drafts)
 */
export async function getAllProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getAllProjects] Error:", error);
    return [];
  }
  return data as Project[];
}

/**
 * Fetches only published projects for the frontend
 */
export async function getPublishedProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("is_av_published", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[getPublishedProjects] Error:", error);
    return [];
  }
  return data as Project[];
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("is_av_published", true)
    .single();

  if (error) return undefined;
  return data as Project;
}

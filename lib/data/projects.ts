import { createClient, createPublicClient } from "@/lib/supabase/server";
import { type Project, type ProjectInsert, projectSchema } from "./projectSchema";

export type { Project, ProjectInsert };
export { projectSchema };

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
    const errorDetails = error instanceof Error 
      ? `${error.message} (Cause: ${(error as any).cause?.message || (error as any).cause})`
      : JSON.stringify(error, Object.getOwnPropertyNames(error));
    console.error("[getAllProjects] Error:", errorDetails);
    return [];
  }
  return data.map((p, i) => ({ ...p, index: i + 1 })) as Project[];
}

/**
 * Fetches only published projects for the frontend
 */
export async function getPublishedProjects(): Promise<Project[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("is_av_published", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[getPublishedProjects] Error:", (error as any)?.message || error);
    return [];
  }
  return data.map((p, i) => ({ ...p, index: i + 1 })) as Project[];
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("is_av_published", true)
    .single();

  if (error) return undefined;
  return data as Project;
}

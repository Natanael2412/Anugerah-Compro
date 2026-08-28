import { createClient } from "@/lib/supabase/server";

export type TiptapDoc = Record<string, unknown>;

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content_json: TiptapDoc;
  published_at: string; // ISO date string from Supabase
  reading_time: number; // minutes from Supabase
  tags: string[];
  cover_image_url?: string;
  is_av_published: boolean;
  is_personal_published?: boolean;
}

/**
 * Fetches ALL articles for Admin Dashboard (includes drafts)
 */
export async function getAllArticles(): Promise<Article[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getAllArticles] Error:", error);
    return [];
  }
  return data as Article[];
}

/**
 * Fetches only published articles for the frontend
 */
export async function getPublishedArticles(): Promise<Article[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("is_av_published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("[getPublishedArticles] Error:", error);
    return [];
  }
  return data as Article[];
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("is_av_published", true)
    .single();

  if (error) return undefined;
  return data as Article;
}

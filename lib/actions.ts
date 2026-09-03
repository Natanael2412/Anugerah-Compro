"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// ─────────────────────────────────────────────────────────────
// ARTICLES
// ─────────────────────────────────────────────────────────────

export async function deleteArticle(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/articles");
}

export async function updateArticle(id: string, data: Record<string, unknown>) {
  const supabase = await createClient();
  const { error } = await supabase.from("articles").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/articles");
  revalidatePath(`/insights/${data.slug ?? ""}`);
  redirect("/admin/articles");
}

// ─────────────────────────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────────────────────────

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/projects");
}

export async function updateProject(id: string, data: Record<string, unknown>) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/projects");
  revalidatePath(`/work/${data.slug ?? ""}`);
  redirect("/admin/projects");
}

export async function createProject(data: Record<string, unknown>) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").insert(data);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}

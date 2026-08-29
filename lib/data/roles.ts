"use server";

import { createClient } from "@/lib/supabase/server";

export interface Role {
  id: string;
  name: string;
  created_at: string;
}

export async function getRoles(): Promise<Role[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("[getRoles] Error:", error);
    return [];
  }
  return data as Role[];
}

export async function addRole(name: string): Promise<Role | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("roles")
    .insert([{ name }])
    .select()
    .single();

  if (error) {
    console.error("[addRole] Error:", error);
    return null;
  }
  return data as Role;
}

export async function updateRole(id: string, name: string): Promise<Role | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("roles")
    .update({ name })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[updateRole] Error:", error);
    return null;
  }
  return data as Role;
}

export async function deleteRole(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("roles")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[deleteRole] Error:", error);
    return false;
  }
  return true;
}

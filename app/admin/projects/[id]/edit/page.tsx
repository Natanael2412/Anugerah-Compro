import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditProjectForm from "./EditProjectForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project || error) notFound();

  return <EditProjectForm project={project} />;
}

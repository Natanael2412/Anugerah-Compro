import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditArticleForm from "./EditArticleForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: article, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (!article || error) notFound();

  return <EditArticleForm article={article} />;
}

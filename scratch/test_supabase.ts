import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY", { supabaseUrl, supabaseKey });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey || supabaseKey);

async function test() {
  console.log("Testing projects fetch...");
  console.log("URL:", supabaseUrl);
  const { data, error } = await supabase.from("projects").select("*").limit(5);
  if (error) {
    console.error("Error fetching projects:", error);
  } else {
    console.log(`Fetched ${data?.length || 0} projects.`);
    if (data && data.length > 0) {
      console.log("Sample project IDs:");
      data.forEach(d => console.log(d.id, d.title));
      console.log("Fields on first project:", Object.keys(data[0]));
    }
  }
}

test();

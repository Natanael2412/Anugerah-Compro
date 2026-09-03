import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
  process.exit(1);
}

// Test with ONLY anon key (simulating client or unprivileged server without RLS bypass)
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing projects fetch with ANON key...");
  const { data, error } = await supabase.from("projects").select("*").limit(5);
  if (error) {
    console.error("Error fetching projects:", error);
  } else {
    console.log(`Fetched ${data?.length || 0} projects with ANON key.`);
  }
}

test();

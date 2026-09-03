import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, serviceKey!);

async function check() {
  const { data } = await supabase.from('projects').select('id, title, is_av_published, is_personal_published');
  console.log(data);
}
check();

import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "https://dxxuwuxtlpwvwovsoker.supabase.co",
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7TGFob1vSztClO_wzhRKkw_3eLTHuzB"
)

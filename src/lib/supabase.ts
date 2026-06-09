import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "";
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseKey);

/** Supabaseが設定済みかどうか */
export const isSupabaseConfigured =
  supabaseUrl.startsWith("https://") && supabaseKey.length > 10;

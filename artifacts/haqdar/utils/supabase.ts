import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// No auth session needed — device UUID is used directly as the identity key
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

export type SupabaseIncident = {
  id: string;
  device_id: string;
  title: string;
  narrative: string;
  media_type: "none" | "image" | "audio";
  media_filename: string;
  media_uri: string | null;
  hash: string;
  legal_categories: string[];
  timestamp: string;
  created_at: string;
};

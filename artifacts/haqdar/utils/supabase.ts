import { createClient } from "@supabase/supabase-js";
import type { MediaItem } from "./storage";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

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
  media: MediaItem[];
  hash: string;
  legal_categories: string[];
  timestamp: string;
  created_at: string;
};

import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type SupabaseIncident = {
  id: string;
  user_id: string;
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

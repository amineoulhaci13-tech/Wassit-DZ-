
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gdlgxrjurypmgjrtacki.supabase.co';
const supabaseAnonKey = 'sb_publishable_aAjCReC-VRbicmVb5kIkAg_VgBQ6FNd';

export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

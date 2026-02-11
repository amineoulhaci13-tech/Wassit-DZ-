
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string | undefined => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore ReferenceError if process is not defined
  }
  return undefined;
};

// استخدام القيم المقدمة مباشرة لحل مشكلة الاتصال
const supabaseUrl = getEnv('SUPABASE_URL') || 'https://gdlgxrjurypmgjrtacki.supabase.co';
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY') || 'sb_publishable_aAjCReC-VRbicmVb5kIkAg_VgBQ6FNd';

export const isSupabaseConfigured = () => {
  return supabaseUrl.length > 0 && !supabaseUrl.includes('none.supabase.co');
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

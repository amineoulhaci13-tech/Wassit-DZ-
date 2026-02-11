
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gdlgxrjurypmgjrtacki.supabase.co';
const supabaseAnonKey = 'sb_publishable_aAjCReC-VRbicmVb5kIkAg_VgBQ6FNd';

// فحص أمان للمتغيرات قبل التشغيل
export const isSupabaseConfigured = () => {
  // Removed redundant check for 'YOUR_ANON_KEY' to resolve TypeScript error regarding non-overlapping literal types
  const isOk = !!supabaseUrl && !!supabaseAnonKey;
  if (!isOk) {
    console.error('CRITICAL ERROR: Supabase configuration is missing or invalid.');
  }
  return isOk;
};

// سجل للتأكد من التحميل في Vercel
console.log('Supabase Initializing...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

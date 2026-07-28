import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').trim();
const supabaseAnonKey = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();

const urlOk = /^https?:\/\//i.test(supabaseUrl);

if (!urlOk || !supabaseAnonKey) {
  console.warn(
    'Missing or invalid EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
      'URL must start with https:// (Project Settings → API). Restart Metro after editing .env.',
  );
}

/**
 * Placeholder URL keeps createClient from throwing at import time when env is wrong,
 * so the app can still boot and show Auth UI with a clear error.
 */
export const supabase: SupabaseClient = createClient(
  urlOk ? supabaseUrl : 'https://placeholder.supabase.co',
  supabaseAnonKey || 'public-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

export const isSupabaseConfigured = urlOk && Boolean(supabaseAnonKey);

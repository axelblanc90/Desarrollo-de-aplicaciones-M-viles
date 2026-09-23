import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || '';
const rawKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

const isPlaceholderUrl =
  !rawUrl ||
  rawUrl.includes('your-project') ||
  rawUrl.includes('placeholder') ||
  rawUrl.includes('example.com') ||
  rawUrl.startsWith('http://your-') ||
  rawUrl.startsWith('https://your-');

const isPlaceholderKey =
  !rawKey ||
  rawKey === 'dummy_anon_key' ||
  rawKey.includes('...') ||
  rawKey.includes('your-anon-key') ||
  rawKey.length < 30;

export const isSupabaseConfigured = Boolean(!isPlaceholderUrl && !isPlaceholderKey);

const supabaseUrl = isSupabaseConfigured ? rawUrl : 'https://placeholder.local';
const supabaseAnonKey = isSupabaseConfigured ? rawKey : 'dummy_anon_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: isSupabaseConfigured,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

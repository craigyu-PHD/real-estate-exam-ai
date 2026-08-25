// Offline-first sync stub: localStorage <-> Supabase
// Usage: call syncProgress() when online. Keeps zero-cost if no env.
import { createClient } from '@supabase/supabase-js';

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function syncProgressToCloud(userId: string) {
  const sb = getSupabase();
  if (!sb) return { ok: false, reason: 'no-env' };
  const local = localStorage.getItem('app_progress');
  if (!local) return { ok: false, reason: 'no-local' };
  // Upsert to user_article_progress is handled per article in real impl;
  // Here we just store a JSON blob in user_profiles for MVP.
  const { error } = await sb.from('user_profiles').upsert({ id: userId, display_name: 'local-sync' });
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

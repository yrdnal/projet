import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'malagasyshop-auth-token',
  },
  global: {
    headers: {
      'x-application-name': 'MalagasyShop',
    },
  },
});

// Log connection status
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection error:', error.message);
  } else {
    console.log('Supabase connected successfully');
    if (data.session) {
      console.log('Active session found for user:', data.session.user.email);
    }
  }
}).catch(err => {
  console.error('Supabase initialization error:', err);
});

// Helper: normalize a Supabase auth user + profile row into the shape the frontend expects
export function normalizeUser(profile) {
  if (!profile) return null;
  return {
    id: profile.id,
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    email: profile.email || '',
    phone: profile.phone || '',
    emailContact: profile.email_contact || '',
    role: profile.role || 'client',
    isActive: profile.is_active ?? true,
    avatarUrl: profile.avatar_url || '',
    createdAt: profile.created_at,
    vendorProfile: profile.vendor_profiles?.[0] || profile.vendor_profile || null,
  };
}

// Helper: fetch the profile row for the current auth user
export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, vendor_profiles(*)')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export default supabase;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase, normalizeUser, fetchProfile } from '../../services/supabase';

// ── Login ──
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      try {
        const profile = await fetchProfile(data.user.id);
        return { user: normalizeUser(profile) };
      } catch (profileError) {
        console.warn('Using fallback user metadata:', profileError);
        return {
          user: {
            id: data.user.id,
            firstName: data.user.user_metadata?.first_name || '',
            lastName: data.user.user_metadata?.last_name || '',
            email: data.user.email,
            role: data.user.user_metadata?.role || 'client',
          }
        };
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Échec de la connexion');
    }
  }
);

// ── Register ──
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const meta = {
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role || 'client',
        phone: userData.phone || null,
        email_contact: userData.emailContact || null,
      };

      // Vendor-specific metadata
      if (userData.role === 'vendor') {
        meta.shop_name = userData.shopName || '';
        meta.phone_numbers = userData.phoneNumbers || [];
        meta.contact_email = userData.contactEmail || userData.email;
      }

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: { data: meta },
      });

      if (error) {
        if (error.message.includes('User already registered') || error.status === 422) {
          throw new Error("Cette adresse email est déjà utilisée. Si vous souhaitez créer un autre compte (ex: Vendeur), utilisez l'astuce de l'alias (+vendeur) comme suggéré ci-dessous.");
        }
        throw error;
      }

      // Wait briefly for the trigger to create the profile
      await new Promise((r) => setTimeout(r, 1000));

      const profile = await fetchProfile(data.user.id);
      return { user: normalizeUser(profile) };
    } catch (error) {
      return rejectWithValue(error.message || "Échec de l'inscription");
    }
  }
);

// ── Get Current User ──
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      const user = session?.user;
      if (error || !user) throw error || new Error('Non authentifié');

      try {
        const profile = await fetchProfile(user.id);
        return normalizeUser(profile);
      } catch (profileError) {
        console.warn('Profile fetch failed, using session user:', profileError);
        return {
          id: user.id,
          email: user.email,
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || '',
          role: user.user_metadata?.role || 'client',
        };
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Impossible de récupérer le profil');
    }
  }
);

// ── Logout ──
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return null;
    } catch (error) {
      return rejectWithValue(error.message || 'Échec de la déconnexion');
    }
  }
);

// ── Update Profile ──
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone: profileData.phone,
          email_contact: profileData.emailContact,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update vendor profile if applicable
      if (profileData.shopName) {
        await supabase
          .from('vendor_profiles')
          .update({
            shop_name: profileData.shopName,
            phone_numbers: profileData.phoneNumbers || [],
            contact_email: profileData.contactEmail || '',
          })
          .eq('user_id', user.id);
      }

      const profile = await fetchProfile(user.id);
      return normalizeUser(profile);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ── State ──
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Register
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Get current user
      .addCase(getCurrentUser.pending, (state) => { state.loading = true; })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logout.pending, (state) => { state.loading = true; })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      // Update profile
      .addCase(updateProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setUser, setLoading } = authSlice.actions;
export default authSlice.reducer;

import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { router } from './routes';
import { getCurrentUser, setUser, setLoading } from './store/slices/authSlice';
import { fetchCart } from './store/slices/cartSlice';
import { supabase, normalizeUser, fetchProfile } from './services/supabase';
import DictionaryTool from './components/common/DictionaryTool';

function App() {
  useEffect(() => {
    let isInitializing = true;

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if we already have the user in store to avoid double-fetch during login
          const currentUser = store.getState().auth.user;
          if (!currentUser || currentUser.id !== session.user.id) {
            try {
              const profile = await fetchProfile(session.user.id);
              store.dispatch(setUser(normalizeUser(profile)));
            } catch (error) {
              console.warn('Profile fetch failed, using session data:', error);
              store.dispatch(setUser({
                id: session.user.id,
                email: session.user.email,
                firstName: session.user.user_metadata?.first_name || '',
                lastName: session.user.user_metadata?.last_name || '',
                role: session.user.user_metadata?.role || 'client',
              }));
            }
          }
        } else if (event === 'SIGNED_OUT') {
          store.dispatch(setUser(null));
        } else if (event === 'INITIAL_SESSION' && session?.user && !isInitializing) {
          // Handle session restoration on refresh
          const currentUser = store.getState().auth.user;
          if (!currentUser || currentUser.id !== session.user.id) {
            try {
              const profile = await fetchProfile(session.user.id);
              store.dispatch(setUser(normalizeUser(profile)));
            } catch (error) {
              console.warn('Profile fetch failed on refresh:', error);
              store.dispatch(setUser({
                id: session.user.id,
                email: session.user.email,
                firstName: session.user.user_metadata?.first_name || '',
                lastName: session.user.user_metadata?.last_name || '',
                role: session.user.user_metadata?.role || 'client',
              }));
            }
          }
        }
      }
    );

    const initAuth = async () => {
      try {
        store.dispatch(setLoading(true));
        
        // Check if we have persisted state
        const persistedUser = store.getState().auth.user;
        
        // Always verify with Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          store.dispatch(setUser(null));
        } else if (session?.user) {
          // Session exists, fetch fresh profile
          try {
            await store.dispatch(getCurrentUser()).unwrap();
          } catch (err) {
            console.warn('getCurrentUser failed, using persisted or session data:', err);
            // If we have persisted user and session matches, keep it
            if (persistedUser && persistedUser.id === session.user.id) {
              // Keep persisted user
            } else {
              // Fallback to session metadata
              store.dispatch(setUser({
                id: session.user.id,
                email: session.user.email,
                firstName: session.user.user_metadata?.first_name || '',
                lastName: session.user.user_metadata?.last_name || '',
                role: session.user.user_metadata?.role || 'client',
              }));
            }
          }
        } else {
          // No session, clear any persisted state
          store.dispatch(setUser(null));
        }
      } catch (err) {
        console.error('Initial auth check failed:', err);
        store.dispatch(setUser(null));
      } finally {
        store.dispatch(setLoading(false));
        isInitializing = false;
      }
    };

    initAuth();

    // Always fetch cart (for both users and guests)
    store.dispatch(fetchCart());

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Provider store={store}>
      <RouterProvider router={router} />
      <DictionaryTool />
    </Provider>
  );
}

export default App;

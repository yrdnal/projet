// Redux persistence middleware for auth state
const PERSIST_KEY = 'malagasyshop_auth_state';

export const persistMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Save auth state to localStorage after certain actions
  if (
    action.type?.startsWith('auth/') && 
    (action.type.includes('fulfilled') || action.type === 'auth/setUser')
  ) {
    const { auth } = store.getState();
    try {
      localStorage.setItem(PERSIST_KEY, JSON.stringify({
        user: auth.user,
        isAuthenticated: auth.isAuthenticated,
      }));
    } catch (error) {
      console.warn('Failed to persist auth state:', error);
    }
  }
  
  // Clear persisted state on logout
  if (action.type === 'auth/logout/fulfilled') {
    try {
      localStorage.removeItem(PERSIST_KEY);
    } catch (error) {
      console.warn('Failed to clear persisted auth state:', error);
    }
  }
  
  return result;
};

export const loadPersistedState = () => {
  try {
    const serialized = localStorage.getItem(PERSIST_KEY);
    if (serialized === null) {
      return undefined;
    }
    return JSON.parse(serialized);
  } catch (error) {
    console.warn('Failed to load persisted state:', error);
    return undefined;
  }
};

export const clearPersistedState = () => {
  try {
    localStorage.removeItem(PERSIST_KEY);
  } catch (error) {
    console.warn('Failed to clear persisted state:', error);
  }
};

// Made with Bob

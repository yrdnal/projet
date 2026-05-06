import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../services/supabase';

// Helper: get or create cart for the current user / session
async function getOrCreateCart() {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  let cart = null;

  if (user) {
    // Authenticated user
    const { data } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      cart = data;
    } else {
      const { data: newCart, error } = await supabase
        .from('carts')
        .insert({ user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      cart = newCart;
    }
  } else {
    // Guest user with session ID
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).slice(2);
      localStorage.setItem('sessionId', sessionId);
    }

    const { data } = await supabase
      .from('carts')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      cart = data;
    } else {
      const { data: newCart, error } = await supabase
        .from('carts')
        .insert({ session_id: sessionId })
        .select()
        .single();
      if (error) throw error;
      cart = newCart;
    }
  }

  return cart;
}

// ── Fetch Cart ──
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const cart = await getOrCreateCart();

      const { data: items, error } = await supabase
        .from('cart_items')
        .select('*, product:products(id, name, description, price, compare_price, images, stock, vendor_id)')
        .eq('cart_id', cart.id);

      if (error) throw error;

      // Calculate subtotal
      const subtotal = (items || []).reduce((sum, item) => {
        const price = item.product?.price || 0;
        return sum + price * item.quantity;
      }, 0);

      // Normalize items to match expected format
      const normalizedItems = (items || []).map((item) => ({
        id: item.id,
        cartId: item.cart_id,
        productId: item.product_id,
        quantity: item.quantity,
        product: item.product
          ? {
              ...item.product,
              discountPrice: item.product.compare_price ? item.product.price : null,
              images: (item.product.images || []).map((url, i) => ({ id: i, imageUrl: url })),
            }
          : null,
      }));

      return {
        data: {
          id: cart.id,
          items: normalizedItems,
          subtotal: subtotal.toFixed(2),
        },
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Impossible de charger le panier');
    }
  }
);

// ── Add to Cart ──
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1 }, { dispatch, rejectWithValue }) => {
    try {
      const cart = await getOrCreateCart();

      // Check if item already exists
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cart.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('cart_items')
          .insert({ cart_id: cart.id, product_id: productId, quantity });
      }

      dispatch(fetchCart());
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.message || "Impossible d'ajouter au panier");
    }
  }
);

// ── Update Cart Item ──
export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { dispatch, rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      if (error) throw error;
      dispatch(fetchCart());
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.message || 'Impossible de modifier le panier');
    }
  }
);

// ── Remove from Cart ──
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { dispatch, rejectWithValue }) => {
    try {
      const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
      if (error) throw error;
      dispatch(fetchCart());
      return itemId;
    } catch (error) {
      return rejectWithValue(error.message || 'Impossible de retirer du panier');
    }
  }
);

// ── Clear Cart ──
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const cart = await getOrCreateCart();
      const { error } = await supabase.from('cart_items').delete().eq('cart_id', cart.id);
      if (error) throw error;
      dispatch(fetchCart());
      return null;
    } catch (error) {
      return rejectWithValue(error.message || 'Impossible de vider le panier');
    }
  }
);

// ── Merge Cart (guest → authenticated) ──
export const mergeCart = createAsyncThunk(
  'cart/mergeCart',
  async (sessionId, { dispatch, rejectWithValue }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      // Find guest cart
      const { data: guestCart } = await supabase
        .from('carts')
        .select('id')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (!guestCart) return;

      // Get user's cart
      let { data: userCart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!userCart) {
        const { data: newCart } = await supabase
          .from('carts')
          .insert({ user_id: user.id })
          .select()
          .single();
        userCart = newCart;
      }

      // Get guest cart items
      const { data: guestItems } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', guestCart.id);

      // Merge items
      for (const item of guestItems || []) {
        const { data: existing } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('cart_id', userCart.id)
          .eq('product_id', item.product_id)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + item.quantity })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('cart_items')
            .insert({ cart_id: userCart.id, product_id: item.product_id, quantity: item.quantity });
        }
      }

      // Delete guest cart
      await supabase.from('carts').delete().eq('id', guestCart.id);
      localStorage.removeItem('sessionId');

      dispatch(fetchCart());
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.message || 'Impossible de fusionner le panier');
    }
  }
);

const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    resetCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        const items = action.payload.data?.items || [];
        state.loading = false;
        state.items = items;
        state.totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        state.totalPrice = parseFloat(action.payload.data?.subtotal || 0);
      })
      .addCase(fetchCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(addToCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addToCart.fulfilled, (state) => { state.loading = false; })
      .addCase(addToCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(updateCartItem.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateCartItem.fulfilled, (state) => { state.loading = false; })
      .addCase(updateCartItem.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(removeFromCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(removeFromCart.fulfilled, (state) => { state.loading = false; })
      .addCase(removeFromCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(clearCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.totalItems = 0;
        state.totalPrice = 0;
      })
      .addCase(clearCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearError, resetCart } = cartSlice.actions;
export default cartSlice.reducer;

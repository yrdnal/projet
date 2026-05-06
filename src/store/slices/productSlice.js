import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../services/supabase';

// ── Fetch Products (public) ──
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 12, search, category, minPrice, maxPrice, sortBy = 'created_at', sortOrder = 'desc' } = params;

      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('status', 'active');

      if (search) query = query.ilike('name', `%${search}%`);
      if (category) query = query.eq('category_id', category);
      if (minPrice) query = query.gte('price', parseFloat(minPrice));
      if (maxPrice) query = query.lte('price', parseFloat(maxPrice));

      // Map frontend sort fields to database columns
      const dbSortBy = sortBy === 'created_at' ? 'created_at' : sortBy === 'price' ? 'price' : sortBy === 'name' ? 'name' : 'created_at';
      query = query.order(dbSortBy, { ascending: sortOrder === 'asc' });
      query = query.range((page - 1) * limit, page * limit - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Impossible de charger les produits');
    }
  }
);

// ── Fetch Product By ID ──
export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*), vendor:profiles!products_vendor_id_fkey(id, first_name, last_name, email, vendor_profiles(*))')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return rejectWithValue(error.message || 'Produit introuvable');
    }
  }
);

// ── Fetch Categories ──
export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      // Safe mapping without counting products
      const categories = (data || []).map((cat) => ({
        ...cat,
        productCount: 0, // Simplified for now
      }));

      return { data: categories };
    } catch (error) {
      return rejectWithValue(error.message || 'Impossible de charger les catégories');
    }
  }
);

// ── Create Product (vendor) ──
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error('Non authentifié');

      let images = [];

      // Handle FormData (file uploads)
      if (productData instanceof FormData) {
        const files = productData.getAll('images');
        for (const file of files) {
          if (file instanceof File && file.size > 0) {
            const ext = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
            const { error: upErr } = await supabase.storage
              .from('product-images')
              .upload(fileName, file);
            if (upErr) throw upErr;

            const { data: urlData } = supabase.storage
              .from('product-images')
              .getPublicUrl(fileName);
            images.push(urlData.publicUrl);
          }
        }

        const { data, error } = await supabase
          .from('products')
          .insert({
            name: productData.get('name'),
            description: productData.get('description'),
            price: parseFloat(productData.get('price')) || 0,
            compare_price: parseFloat(productData.get('compareAtPrice')) || null,
            category_id: productData.get('categoryId') || null,
            vendor_id: user.id,
            sku: productData.get('sku') || null,
            stock: parseInt(productData.get('stockQuantity') || '0', 10),
            status: 'active',
            images,
          })
          .select('*, category:categories(*), vendor:profiles!products_vendor_id_fkey(id, first_name, last_name, email)')
          .single();

        if (error) throw error;
        return { data };
      }

      // Handle plain object
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          vendor_id: user.id,
          images: productData.images || [],
        })
        .select('*, category:categories(*), vendor:profiles!products_vendor_id_fkey(id, first_name, last_name, email)')
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return rejectWithValue(error.message || 'Impossible de créer le produit');
    }
  }
);

// ── Update Product ──
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error('Non authentifié');

      let updatePayload = {};
      let newImages = [];

      if (productData instanceof FormData) {
        const files = productData.getAll('images');
        for (const file of files) {
          if (file instanceof File && file.size > 0) {
            const ext = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
            const { error: upErr } = await supabase.storage.from('product-images').upload(fileName, file);
            if (upErr) throw upErr;
            const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
            newImages.push(urlData.publicUrl);
          }
        }

        updatePayload = {
          name: productData.get('name'),
          description: productData.get('description'),
          price: parseFloat(productData.get('price')) || 0,
          compare_price: parseFloat(productData.get('compareAtPrice')) || null,
          category_id: productData.get('categoryId') || null,
          sku: productData.get('sku') || null,
          stock: parseInt(productData.get('stockQuantity') || '0', 10),
        };
        if (newImages.length > 0) updatePayload.images = newImages;
      } else {
        updatePayload = { ...productData };
      }

      const { data, error } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', id)
        .select('*, category:categories(*), vendor:profiles!products_vendor_id_fkey(id, first_name, last_name, email)')
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return rejectWithValue(error.message || 'Impossible de modifier le produit');
    }
  }
);

// ── Delete Product ──
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Impossible de supprimer le produit');
    }
  }
);

// ── Fetch Vendor Products ──
export const fetchVendorProducts = createAsyncThunk(
  'products/fetchVendorProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error('Non authentifié');

      const { page = 1, limit = 20 } = params;

      const { data, error, count } = await supabase
        .from('products')
        .select('*, category:categories(*)', { count: 'exact' })
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Impossible de charger vos produits');
    }
  }
);

// ── Fetch ALL Products (admin) ──
export const fetchAllProducts = createAsyncThunk(
  'products/fetchAllProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 20, status } = params;

      let query = supabase
        .from('products')
        .select('*, category:categories(*), vendor:profiles!products_vendor_id_fkey(id, first_name, last_name, email)', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (status) query = query.eq('status', status);
      query = query.range((page - 1) * limit, page * limit - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        data: data || [],
        pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  products: [],
  currentProduct: null,
  categories: [],
  vendorProducts: [],
  pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
  filters: { search: '', category: '', minPrice: '', maxPrice: '', sortBy: 'created_at', sortOrder: 'desc' },
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    clearFilters: (state) => { state.filters = initialState.filters; },
    clearCurrentProduct: (state) => { state.currentProduct = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchProductById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProductById.fulfilled, (state, action) => { state.loading = false; state.currentProduct = action.payload.data; })
      .addCase(fetchProductById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchCategories.pending, (state) => { state.loading = true; })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.loading = false; state.categories = action.payload.data || []; })
      .addCase(fetchCategories.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(createProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createProduct.fulfilled, (state, action) => { state.loading = false; state.vendorProducts.unshift(action.payload.data); })
      .addCase(createProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(updateProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const i = state.vendorProducts.findIndex((p) => p.id === action.payload.data.id);
        if (i !== -1) state.vendorProducts[i] = action.payload.data;
      })
      .addCase(updateProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(deleteProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.vendorProducts = state.vendorProducts.filter((p) => p.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchVendorProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchVendorProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.vendorProducts = action.payload.data || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchVendorProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchAllProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearError, setFilters, clearFilters, clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;

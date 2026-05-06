// ============================================================
// API Compatibility Layer — Routes old api.get/post/put/patch/delete
// calls to Supabase queries seamlessly. Pages that import from
// this file will continue to work without modification.
// ============================================================
import { supabase } from './supabase';

const handlers = {
  // ── DASHBOARD ──
  'GET /dashboard/admin': async () => {
    const [
      { count: usersCount },
      { count: productsCount },
      { count: ordersCount },
      { count: pendingCount },
      { count: vendorCount },
      { data: recentUsers },
      { data: pendingProducts },
      { data: allOrders },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'vendor'),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('products').select('*, vendor:profiles!products_vendor_id_fkey(first_name, last_name)').eq('status', 'pending').limit(5),
      supabase.from('orders').select('total').limit(500),
    ]);
    const revenue = (allOrders || []).reduce((s, o) => s + parseFloat(o.total || 0), 0);
    return {
      data: {
        data: {
          users: { total: usersCount || 0, byRole: { vendor: vendorCount || 0 } },
          products: { total: productsCount || 0, byStatus: { pending: pendingCount || 0 } },
          orders: { total: ordersCount || 0, revenue },
          recentUsers: (recentUsers || []).map(u => ({
            id: u.id, firstName: u.first_name, lastName: u.last_name,
            email: u.email, role: u.role, createdAt: u.created_at,
          })),
          pendingProducts: (pendingProducts || []).map(p => ({
            id: p.id, name: p.name,
            vendorName: p.vendor ? `${p.vendor.first_name} ${p.vendor.last_name}` : '—',
          })),
          recentOrders: [],
        },
      },
    };
  },

  'GET /dashboard/vendor': async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) throw new Error('Not authenticated');

    const [
      { count: productsCount },
      { data: orderItems },
      { data: recentOrders },
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('vendor_id', user.id),
      supabase.from('order_items').select('total_price, status').eq('vendor_id', user.id),
      supabase.from('order_items').select('*, orders(id, order_number, status, created_at, customer:profiles!orders_user_id_fkey(first_name, last_name))').eq('vendor_id', user.id).order('created_at', { ascending: false }).limit(5),
    ]);

    const revenue = (orderItems || []).reduce((s, i) => s + parseFloat(i.total_price || 0), 0);
    const ordersTotal = (orderItems || []).length;
    const pending = (orderItems || []).filter(i => i.status === 'pending').length;

    return {
      data: {
        data: {
          revenue,
          products: { total: productsCount || 0 },
          orders: { total: ordersTotal, pending },
          recentOrders: (recentOrders || []).slice(0, 5).map(i => ({
            id: i.orders?.id, orderNumber: i.orders?.order_number,
            status: i.orders?.status, createdAt: i.orders?.created_at,
            customerName: i.orders?.customer ? `${i.orders.customer.first_name} ${i.orders.customer.last_name}` : '—',
          })),
        },
      },
    };
  },

  'GET /dashboard/superadmin': async () => {
    return handlers['GET /dashboard/admin']();
  },

  // ── USERS (admin) ──
  'GET /auth/users': async (params) => {
    let query = supabase.from('profiles').select('*', { count: 'exact' });
    if (params.search) {
      query = query.or(`first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
    }
    if (params.role && params.role !== 'all') query = query.eq('role', params.role);
    if (params.status === 'active') query = query.eq('is_active', true);
    if (params.status === 'inactive') query = query.eq('is_active', false);

    const page = parseInt(params.page || '1');
    const limit = parseInt(params.limit || '15');
    query = query.order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: {
        data: {
          users: (data || []).map(u => ({
            id: u.id, firstName: u.first_name, lastName: u.last_name,
            email: u.email, role: u.role, isActive: u.is_active,
            createdAt: u.created_at, phone: u.phone,
          })),
          total: count || 0,
        },
      },
    };
  },

  'PATCH /auth/users/:id': async (_, body, id) => {
    const updates = {};
    if (body.isActive !== undefined) updates.is_active = body.isActive;
    if (body.role) updates.role = body.role;
    const { error } = await supabase.from('profiles').update(updates).eq('id', id);
    if (error) throw error;
    return { data: { success: true } };
  },

  // ── CATEGORIES ──
  'GET /categories': async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return { data: { data: data || [] } };
  },

  'POST /categories': async (_, body) => {
    const { data, error } = await supabase
      .from('categories')
      .insert({ name: body.name, slug: body.slug, description: body.description, parent_id: body.parentId || null })
      .select()
      .single();
    if (error) throw error;
    return { data: { data } };
  },

  'PUT /categories/:id': async (_, body, id) => {
    const { data, error } = await supabase
      .from('categories')
      .update({ name: body.name, slug: body.slug, description: body.description, parent_id: body.parentId || null })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { data: { data } };
  },

  'DELETE /categories/:id': async (_, __, id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    return { data: { success: true } };
  },

  // ── PRODUCTS (admin) ──
  'GET /products': async (params) => {
    const page = parseInt(params.page || '1');
    const limit = parseInt(params.limit || '12');
    let query = supabase.from('products')
      .select('*, category:categories(name), vendor:profiles!products_vendor_id_fkey(first_name, last_name)', { count: 'exact' });
    
    if (params.search) query = query.ilike('name', `%${params.search}%`);
    if (params.status && params.status !== 'all') query = query.eq('status', params.status);
    query = query.order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: {
        data: (data || []).map(p => ({
          ...p,
          vendorName: p.vendor ? `${p.vendor.first_name} ${p.vendor.last_name}` : '—',
          categoryName: p.category?.name || 'Uncategorized',
          images: (p.images || []).map((url, i) => ({ id: i, imageUrl: url })),
        })),
        total: count || 0,
      },
    };
  },

  'PATCH /products/:id': async (_, body, id) => {
    const updates = {};
    if (body.status) updates.status = body.status;
    if (body.isApproved !== undefined) updates.status = body.isApproved ? 'active' : 'inactive';
    const { error } = await supabase.from('products').update(updates).eq('id', id);
    if (error) throw error;
    return { data: { success: true } };
  },

  // ── ORDERS ──
  'GET /orders': async (params) => {
    const page = parseInt(params.page || '1');
    const limit = parseInt(params.limit || '15');
    let query = supabase.from('orders')
      .select('*, order_items(count), customer:profiles!orders_user_id_fkey(first_name, last_name, email)', { count: 'exact' });

    if (params.status && params.status !== 'all') query = query.eq('status', params.status);
    query = query.order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: {
        data: (data || []).map(o => ({
          ...o,
          customerName: o.customer ? `${o.customer.first_name} ${o.customer.last_name}` : '—',
          customerEmail: o.customer?.email || '',
          itemCount: o.order_items?.[0]?.count || 0,
          orderNumber: o.order_number,
          totalAmount: o.total,
        })),
        total: count || 0,
      },
    };
  },

  'PUT /orders/:id/status': async (_, body, id) => {
    const { error } = await supabase.from('orders').update({ status: body.status }).eq('id', id);
    if (error) throw error;
    return { data: { success: true } };
  },

  'PATCH /orders/:id/status': async (_, body, id) => {
    const { error } = await supabase.from('orders').update({ status: body.status }).eq('id', id);
    if (error) throw error;
    return { data: { success: true } };
  },

  'GET /orders/:id': async (_, __, id) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, product:products(id, name, images, price)), customer:profiles!orders_user_id_fkey(id, first_name, last_name, email, phone)')
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      data: {
        data: {
          ...data,
          customerName: data.customer ? `${data.customer.first_name} ${data.customer.last_name}` : '—',
          customerEmail: data.customer?.email || '',
          customerPhone: data.customer?.phone || '',
          customerId: data.customer?.id,
          items: (data.order_items || []).map(item => ({
            ...item,
            productName: item.product_name || item.product?.name,
            imageUrl: item.product_image || (item.product?.images || [])[0] || null,
            price: parseFloat(item.unit_price),
          })),
        },
      },
    };
  },

  // ── MESSAGES ──
  'GET /messages/conversations': async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(id, first_name, last_name, role, email), receiver:profiles!messages_receiver_id_fkey(id, first_name, last_name, role, email)')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group by conversation partner
    const convoMap = {};
    for (const msg of data || []) {
      const other = msg.sender_id === user.id ? msg.receiver : msg.sender;
      const otherId = other?.id;
      if (!otherId) continue;
      if (!convoMap[otherId]) {
        convoMap[otherId] = {
          other_id: otherId,
          first_name: other.first_name,
          last_name: other.last_name,
          role: other.role,
          last_message: msg.content,
          last_message_at: msg.created_at,
        };
      }
    }
    return { data: { data: Object.values(convoMap) } };
  },

  'GET /messages/:id': async (_, __, otherId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { data: { data: data || [] } };
  },

  'GET /messages': async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(first_name, last_name, email), receiver:profiles!messages_receiver_id_fkey(first_name, last_name, email)')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return { data: { data: data || [] } };
  },

  'POST /messages': async (_, body) => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .insert({ sender_id: user.id, receiver_id: body.receiverId, content: body.content })
      .select()
      .single();

    if (error) throw error;
    return { data: { data } };
  },

  // ── VERIFY EMAIL ──
  'POST /auth/verify-email': async (_, body) => {
    return { data: { success: true, message: 'Email verified via Supabase Auth' } };
  },

  // ── SYSTEM SETTINGS ──
  'GET /settings': async () => {
    const { data, error } = await supabase.from('system_settings').select('*');
    if (error) throw error;
    const settings = {};
    (data || []).forEach(s => { settings[s.key] = s.value; });
    return { data: { data: settings } };
  },

  'PUT /settings': async (_, body) => {
    for (const [key, value] of Object.entries(body)) {
      await supabase.from('system_settings').upsert({ key, value: JSON.stringify(value) }, { onConflict: 'key' });
    }
    return { data: { success: true } };
  },

  'PUT /dashboard/settings': async (_, body) => {
    for (const [key, value] of Object.entries(body)) {
      await supabase.from('system_settings').upsert({ key, value: JSON.stringify(value) }, { onConflict: 'key' });
    }
    return { data: { success: true } };
  },
};

// ── Route matcher ──
function matchRoute(method, path) {
  for (const routeKey of Object.keys(handlers)) {
    const [routeMethod, routePattern] = routeKey.split(' ');
    if (routeMethod !== method) continue;

    const routeParts = routePattern.split('/').filter(Boolean);
    const pathParts = path.split('?')[0].split('/').filter(Boolean);

    if (routeParts.length !== pathParts.length) continue;

    let match = true;
    let paramId = null;
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        paramId = pathParts[i];
      } else if (routeParts[i] !== pathParts[i]) {
        match = false;
        break;
      }
    }

    if (match) return { handler: handlers[routeKey], paramId };
  }
  return null;
}

function parseQuery(path) {
  const qs = path.split('?')[1] || '';
  const params = {};
  new URLSearchParams(qs).forEach((v, k) => { params[k] = v; });
  return params;
}

// ── API proxy object ──
const api = {
  async get(path) {
    const params = parseQuery(path);
    const cleanPath = path.split('?')[0];
    const route = matchRoute('GET', cleanPath);
    if (!route) {
      console.warn(`[api] Unhandled GET ${path}`);
      return { data: { data: [] } };
    }
    return route.handler(params, null, route.paramId);
  },

  async post(path, body) {
    const cleanPath = path.split('?')[0];
    const route = matchRoute('POST', cleanPath);
    if (!route) {
      console.warn(`[api] Unhandled POST ${path}`);
      return { data: {} };
    }
    return route.handler({}, body, route.paramId);
  },

  async put(path, body) {
    const cleanPath = path.split('?')[0];
    const route = matchRoute('PUT', cleanPath);
    if (!route) {
      console.warn(`[api] Unhandled PUT ${path}`);
      return { data: {} };
    }
    return route.handler({}, body, route.paramId);
  },

  async patch(path, body) {
    const cleanPath = path.split('?')[0];
    const route = matchRoute('PATCH', cleanPath);
    if (!route) {
      console.warn(`[api] Unhandled PATCH ${path}`);
      return { data: {} };
    }
    return route.handler({}, body, route.paramId);
  },

  async delete(path) {
    const cleanPath = path.split('?')[0];
    const route = matchRoute('DELETE', cleanPath);
    if (!route) {
      console.warn(`[api] Unhandled DELETE ${path}`);
      return { data: {} };
    }
    return route.handler({}, null, route.paramId);
  },
};

export { supabase };
export default api;

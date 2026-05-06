import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  ShoppingCartIcon, MagnifyingGlassIcon, ArrowPathIcon,
  ChevronLeftIcon, ChevronRightIcon, EyeIcon,
} from '@heroicons/react/24/outline';

const ORDER_STATUS = {
  pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Processing', cls: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'Shipped', cls: 'bg-indigo-100 text-indigo-700' },
  delivered: { label: 'Delivered', cls: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-700' },
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const limit = 15;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit });
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await api.get(`/orders?${params}`);
      setOrders(res.data.data?.orders || res.data.data || []);
      setTotal(res.data.data?.total || 0);
    } catch {
      setOrders([]);
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      setSelectedOrder(null);
    } catch { setError('Failed to update order status.'); }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <ShoppingCartIcon className="w-7 h-7 text-orange-500" /> Order Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage all customer orders</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <ArrowPathIcon className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

      {/* Status summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {Object.entries(ORDER_STATUS).map(([key, val]) => (
          <button
            key={key}
            onClick={() => { setStatusFilter(key); setPage(1); }}
            className={`p-4 rounded-xl border-2 text-center transition-all ${statusFilter === key ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-white hover:border-orange-200'}`}
          >
            <p className={`text-lg font-extrabold ${statusFilter === key ? 'text-orange-600' : 'text-gray-900'}`}>—</p>
            <p className="text-xs font-semibold text-gray-500 mt-1">{val.label}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchOrders(); }} className="flex flex-1 max-w-sm">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order ID or customer..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-orange-400 text-white text-sm font-semibold rounded-r-lg hover:bg-orange-500">
              Search
            </button>
          </form>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="all">All Statuses</option>
            {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <LoadingSpinner size="lg" className="py-20" />
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No orders found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Order #', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => {
                    const statusCfg = ORDER_STATUS[order.status] || { label: order.status, cls: 'bg-gray-100 text-gray-700' };
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm font-semibold text-blue-600">
                            #{(order.orderNumber || order.id)?.toString().slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="text-sm font-semibold text-gray-900">{order.customerName || order.userName || '—'}</p>
                          <p className="text-xs text-gray-400">{order.customerEmail || order.userEmail || ''}</p>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                          {order.itemCount || order.items?.length || 0} item(s)
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="font-bold text-gray-900">${parseFloat(order.totalAmount || order.total || 0).toFixed(2)}</span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCfg.cls}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt || order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-400"
                            >
                              {Object.keys(ORDER_STATUS).map((k) => <option key={k} value={k}>{ORDER_STATUS[k].label}</option>)}
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t bg-gray-50">
                <p className="text-sm text-gray-500">Page {page} of {totalPages} — {total} orders</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-40 transition-colors">
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-40 transition-colors">
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;

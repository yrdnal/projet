import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getImageUrl } from '../../utils/url';
import {
  ShoppingBagIcon, MagnifyingGlassIcon, ArrowPathIcon,
  CheckCircleIcon, XCircleIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline';

const STATUS_CONFIG = {
  pending: { label: 'Pending Review', icon: <ClockIcon className="w-3.5 h-3.5" />, cls: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Approved', icon: <CheckCircleIcon className="w-3.5 h-3.5" />, cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', icon: <XCircleIcon className="w-3.5 h-3.5" />, cls: 'bg-red-100 text-red-700' },
  active: { label: 'Active', icon: <CheckCircleIcon className="w-3.5 h-3.5" />, cls: 'bg-green-100 text-green-700' },
  inactive: { label: 'Inactive', icon: <XCircleIcon className="w-3.5 h-3.5" />, cls: 'bg-gray-100 text-gray-600' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, icon: null, cls: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit });
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await api.get(`/products?${params}`);
      setProducts(res.data.data?.products || res.data.data || []);
      setTotal(res.data.data?.total || 0);
    } catch {
      setProducts([]);
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [page, statusFilter]);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/products/${id}`, { status: 'approved', isApproved: true });
      fetchProducts();
    } catch { setError('Failed to approve product.'); }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/products/${id}`, { status: 'rejected', isApproved: false });
      fetchProducts();
    } catch { setError('Failed to reject product.'); }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <ShoppingBagIcon className="w-7 h-7 text-orange-500" /> Product Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Review and approve vendor product submissions</p>
        </div>
        <button onClick={fetchProducts} className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <ArrowPathIcon className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchProducts(); }} className="flex flex-1 max-w-sm">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
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
            <option value="all">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <LoadingSpinner size="lg" className="py-20" />
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No products found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Product', 'Vendor', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {p.images?.[0]?.imageUrl ? (
                              <img src={getImageUrl(p.images[0].imageUrl)} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">📦</div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                            <p className="text-xs text-gray-400">{p.categoryName || 'Uncategorized'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{p.vendorName || '—'}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-900">${parseFloat(p.price).toFixed(2)}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${(p.stockQuantity || 0) < 5 ? 'text-red-600' : 'text-gray-900'}`}>
                          {p.stockQuantity ?? p.stock ?? 0}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <StatusBadge status={p.isApproved ? 'approved' : (p.status || 'pending')} />
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {(!p.isApproved || p.status === 'pending') && (
                            <button
                              onClick={() => handleApprove(p.id)}
                              className="text-xs px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-semibold transition-colors"
                            >
                              Approve
                            </button>
                          )}
                          {p.isApproved && (
                            <button
                              onClick={() => handleReject(p.id)}
                              className="text-xs px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-semibold transition-colors"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
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

export default AdminProducts;

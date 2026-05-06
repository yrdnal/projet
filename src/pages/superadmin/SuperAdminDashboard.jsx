import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  GlobeAltIcon, CogIcon, ShieldCheckIcon, BanknotesIcon,
  UsersIcon, ShoppingBagIcon, ShoppingCartIcon,
  ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { formatPrice } from '../../utils/currency';

const StatCard = ({ icon, label, value, sub, trend, color = 'orange' }) => {
  const colorMap = {
    orange: 'from-orange-500 to-amber-400',
    blue: 'from-blue-600 to-blue-400',
    green: 'from-green-600 to-emerald-400',
    purple: 'from-purple-600 to-violet-400',
    red: 'from-red-600 to-rose-400',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center flex-shrink-0`}>
          <div className="text-white w-6 h-6">{icon}</div>
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
            {trend >= 0 ? <ArrowTrendingUpIcon className="w-3.5 h-3.5" /> : <ArrowTrendingDownIcon className="w-3.5 h-3.5" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-extrabold text-gray-900">{value}</p>
        <p className="text-sm font-semibold text-gray-700 mt-1">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/admin');
        const data = res.data.data;
        setStats({
          totalUsers: data.users.total,
          totalVendors: data.users.byRole.vendor || 0,
          totalProducts: data.products.total,
          totalOrders: data.orders.total,
          totalRevenue: data.orders.revenue,
          pendingProducts: data.products.byStatus.pending || 0,
          activeUsers: data.users.total, // Simplified for now
          recentOrders: data.recentOrders,
          topVendors: [], // Not yet in backend
        });
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
        if (!stats) {
          setStats({
            totalUsers: 0, totalVendors: 0, totalProducts: 0, totalOrders: 0,
            totalRevenue: 0, pendingProducts: 0, activeUsers: 0,
            recentOrders: [], topVendors: [],
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) return <LoadingSpinner size="lg" className="py-20" />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <ShieldCheckIcon className="w-7 h-7 text-orange-500" /> SuperAdmin Control Panel
        </h1>
        <p className="text-sm text-gray-500 mt-1">Complete platform overview and system management</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon={<UsersIcon />} label="Total Users" value={stats?.totalUsers?.toLocaleString() || '0'} sub="Across all roles" trend={12} color="blue" />
        <StatCard icon={<ShoppingBagIcon />} label="Total Products" value={stats?.totalProducts?.toLocaleString() || '0'} sub={`${stats?.pendingProducts || 0} pending approval`} trend={8} color="orange" />
        <StatCard icon={<ShoppingCartIcon />} label="Total Orders" value={stats?.totalOrders?.toLocaleString() || '0'} sub="All time orders" trend={5} color="green" />
        <StatCard icon={<BanknotesIcon />} label="Platform Revenue" value={formatPrice(stats?.totalRevenue || 0)} sub="Gross marketplace value" trend={-2} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Quick Actions</h2>
            <div className="space-y-3">
              {[
                { href: '/superadmin/users', icon: <UsersIcon className="w-5 h-5" />, label: 'Manage All Users', sub: 'View, activate, deactivate', color: 'blue' },
                { href: '/superadmin/settings', icon: <CogIcon className="w-5 h-5" />, label: 'Platform Settings', sub: 'Configure platform-wide settings', color: 'orange' },
                { href: '/admin/products', icon: <ShoppingBagIcon className="w-5 h-5" />, label: 'Product Approvals', sub: `${stats?.pendingProducts || 0} products waiting`, color: 'green' },
                { href: '/admin/categories', icon: <ChartBarIcon className="w-5 h-5" />, label: 'Category Management', sub: 'Organize product taxonomy', color: 'purple' },
              ].map((action) => {
                const colorBg = { blue: 'bg-blue-100 text-blue-600', orange: 'bg-orange-100 text-orange-600', green: 'bg-green-100 text-green-600', purple: 'bg-purple-100 text-purple-600' };
                return (
                  <a key={action.href} href={action.href} className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorBg[action.color]}`}>
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 group-hover:text-orange-600 transition-colors">{action.label}</p>
                      <p className="text-xs text-gray-400">{action.sub}</p>
                    </div>
                    <span className="text-gray-400 group-hover:text-orange-500 transition-colors">→</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Platform health */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 h-full">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <GlobeAltIcon className="w-5 h-5 text-blue-500" /> Platform Health
            </h2>
            <div className="space-y-4">
              {[
                { label: 'Active Users', val: stats?.activeUsers || 0, total: stats?.totalUsers || 1, color: 'bg-blue-500' },
                { label: 'Approved Products', val: (stats?.totalProducts || 0) - (stats?.pendingProducts || 0), total: stats?.totalProducts || 1, color: 'bg-green-500' },
                { label: 'Active Vendors', val: stats?.totalVendors || 0, total: Math.max(stats?.totalVendors || 1, 1), color: 'bg-orange-500' },
              ].map((item) => {
                const pct = Math.min(100, Math.round((item.val / item.total) * 100)) || 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-gray-700">{item.label}</span>
                      <span className="text-gray-500">{item.val.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                <p className="text-2xl font-extrabold text-green-600">{stats?.totalVendors || 0}</p>
                <p className="text-sm font-medium text-green-700 mt-1">Active Vendors</p>
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center">
                <p className="text-2xl font-extrabold text-orange-600">{stats?.pendingProducts || 0}</p>
                <p className="text-sm font-medium text-orange-700 mt-1">Pending Approvals</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

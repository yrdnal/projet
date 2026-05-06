import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { UsersIcon, ShoppingBagIcon, ShoppingCartIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../../utils/i18n_simple';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async (isAuto = false) => {
    try {
      if (!isAuto) setLoading(true);
      else setRefreshing(true);
      
      const response = await api.get('/dashboard/admin');
      setStats(response.data.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Impossible d\'actualiser les données.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStats(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-screen" />;
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">{t('nav.dashboard')}</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            {t('dashboard.real_time_desc')} 
            <span className={`w-2 h-2 rounded-full ${refreshing ? 'bg-blue-400 animate-pulse' : 'bg-green-400'}`}></span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('dashboard.last_updated')}</p>
          <p className="text-sm font-semibold text-gray-700">{lastUpdated.toLocaleTimeString()}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchStats()} className="font-bold underline">Réessayer</button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <UsersIcon className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest bg-blue-50 px-2.5 py-1 rounded-full">UTILISATEURS</span>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats?.users?.total || 0}</p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Total Utilisateurs</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
              <ShoppingBagIcon className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase text-green-600 tracking-widest bg-green-50 px-2.5 py-1 rounded-full">PRODUITS</span>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats?.products?.total || 0}</p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Total Produits</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <ShoppingCartIcon className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full">COMMANDES</span>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats?.orders?.total || 0}</p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Total Commandes</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all">
              <CheckCircleIcon className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase text-orange-600 tracking-widest bg-orange-50 px-2.5 py-1 rounded-full">ATTENTE</span>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats?.products?.byStatus?.pending || 0}</p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Approbations en attente</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">{t('dashboard.recent_users')}</h2>
          {stats?.recentUsers && stats.recentUsers.length > 0 ? (
            <div className="space-y-4">
              {stats.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 line-clamp-1">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-500 truncate max-w-[200px]">{user.email}</p>
                  </div>
                  <span className="badge badge-primary bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{user.role}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">{t('dashboard.no_recent_users')}</p>
          )}
        </div>

        {/* Pending Products */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">{t('dashboard.pending_approvals')}</h2>
          {stats?.pendingProducts && stats.pendingProducts.length > 0 ? (
            <div className="space-y-4">
              {stats.pendingProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                    <p className="text-sm text-gray-500">by {product.vendorName}</p>
                  </div>
                  <span className="badge badge-warning bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">PENDING</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">{t('dashboard.no_pending_approvals')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

// Made with Bob

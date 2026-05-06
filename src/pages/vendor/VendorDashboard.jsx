import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
  ListBulletIcon,
  CheckIcon,
  BanknotesIcon,
  TruckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { getImageUrl } from '../../utils/url';
import { formatPrice } from '../../utils/currency';
import { useTranslation } from '../../utils/i18n_simple';

const StatCard = ({ title, value, icon, sub, trend, colorClass }) => (
  <div className={`group relative overflow-hidden rounded-[2rem] p-7 border ${colorClass ? 'border-transparent text-white shadow-xl shadow-' + colorClass.split('-')[1] + '/20' : 'border-gray-100 bg-white text-gray-900 shadow-sm'} hover:shadow-2xl transition-all duration-500 hover:-translate-y-1`}>
    {colorClass && (
      <>
        <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-100 z-0`} />
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 rounded-full bg-white opacity-10 blur-3xl group-hover:scale-125 transition-transform duration-700 z-0" />
      </>
    )}
    <div className="relative z-10 flex items-start justify-between">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500 ${colorClass ? 'bg-white/20 backdrop-blur-md text-white shadow-inner' : 'bg-orange-50 text-orange-500 border border-orange-100'}`}>
        {icon}
      </div>
      {trend && (
        <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md shadow-sm ${colorClass ? 'bg-white/25 text-white' : 'text-emerald-700 bg-emerald-50 border border-emerald-100'}`}>
          <ArrowTrendingUpIcon className="w-3 h-3" />
          {trend}
        </span>
      )}
    </div>
    <div className="relative z-10 mt-6">
      <p className={`text-4xl font-black tracking-tight ${colorClass ? 'text-white drop-shadow-md' : 'text-gray-900'}`}>{value}</p>
      <p className={`text-xs font-black uppercase tracking-widest mt-2 ${colorClass ? 'text-white/90' : 'text-gray-400'}`}>{title}</p>
      {sub && <p className={`text-[11px] mt-1.5 font-medium ${colorClass ? 'text-white/70' : 'text-gray-500'}`}>{sub}</p>}
    </div>
  </div>
);

const VendorDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const response = await api.get('/dashboard/vendor');
      setStats(response.data.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchStats();
    // Auto-refresh every 30 seconds for "real-time" feeling
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingSpinner size="lg" />
    </div>
  );

  return (
    <div className="max-w-screen-2xl mx-auto pb-12">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-[#0A0F1C] rounded-[2.5rem] p-8 md:p-12 mb-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/5">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-orange-500/20 to-transparent rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-indigo-500/20 to-transparent rounded-full blur-[60px] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white/80 text-xs font-bold uppercase tracking-widest mb-4 border border-white/10">
            <SparklesIcon className="w-4 h-4 text-orange-400" /> Vue d'ensemble
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            {t('dashboard.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Vendeur</span>
          </h1>
          <p className="text-sm text-gray-400 mt-3 font-medium flex items-center gap-2">
            {t('dashboard.real_time_desc')} 
            <span className={`flex w-2.5 h-2.5 rounded-full relative ${refreshing ? 'bg-blue-500' : 'bg-emerald-500'}`}>
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${refreshing ? 'bg-blue-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`}></span>
            </span>
          </p>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-4">
          <div className="text-center md:text-right bg-black/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/5">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('dashboard.last_updated')}</p>
            <p className="text-base font-bold text-white mt-0.5">{lastUpdated.toLocaleTimeString()}</p>
          </div>
          <Link 
            to="/vendor/products/add" 
            className="group flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold px-6 py-4 rounded-2xl shadow-[0_0_40px_-10px_rgba(249,115,22,0.5)] hover:shadow-[0_0_60px_-15px_rgba(249,115,22,0.6)] transition-all duration-300 hover:-translate-y-1 text-sm border border-orange-400/50"
          >
            <div className="bg-white/20 p-1.5 rounded-full group-hover:rotate-90 transition-transform duration-300">
              <PlusIcon className="w-5 h-5" />
            </div>
            {t('product.add')}
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title={t('dashboard.revenue')} 
          value={formatPrice(stats?.orders?.revenue || 0)}
          icon={<BanknotesIcon className="w-7 h-7" />}
          sub="Revenus des 30 derniers jours"
          trend="+12.5%"
          colorClass="from-indigo-600 to-indigo-800"
        />
        <StatCard 
          title={t('dashboard.products')} 
          value={stats?.products?.total || 0} 
          icon={<ShoppingBagIcon className="w-7 h-7" />}
          sub={`${stats?.products?.approved || 0} expédiés, ${stats?.products?.pending || 0} ${t('order.status_pending').toLowerCase()}`}
          trend="+4.2%"
        />
        <StatCard 
          title={t('nav.orders')} 
          value={stats?.orders?.total || 0} 
          icon={<TruckIcon className="w-7 h-7" />}
          sub="Commandes prêtent à l'envoi"
        />
        <StatCard 
          title="Alerte Stock" 
          value={stats?.lowStock?.length || 0} 
          icon={<ExclamationTriangleIcon className="w-7 h-7" />}
          sub="Attention immédiate requise"
        />
      </div>

      <div className="grid xl:grid-cols-3 gap-8">
        {/* Top Selling Products */}
        <div className="xl:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-sm shadow-gray-200/50 overflow-hidden">
          <div className="p-7 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl">
                <ChartBarIcon className="w-6 h-6" />
              </div>
              Performances des Ventes
            </h2>
            <Link to="/vendor/products" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition-colors">Tout afficher</Link>
          </div>
          <div className="p-7">
            {stats?.topProducts && stats.topProducts.length > 0 ? (
              <div className="space-y-4">
                {stats.topProducts.map((product, index) => (
                  <div key={product.id} className="group flex items-center gap-5 p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all duration-300">
                    <div className="relative w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shadow-inner">
                      {product.primaryImage ? (
                        <img src={getImageUrl(product.primaryImage)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <span className="text-gray-400 font-black text-xl">{index + 1}</span>
                      )}
                      
                      {index < 3 && (
                        <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-bl-lg">
                          TOP
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md font-medium">{product.totalSold} unités</span>
                        <span className="text-[11px] text-gray-400 font-medium">ce mois-ci</span>
                      </div>
                    </div>
                    <div className="text-right pl-4">
                      <p className="text-lg font-black text-gray-900">{formatPrice(product.revenue)}</p>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-0.5">En hausse</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <ChartBarIcon className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">Aucune donnée de vente pour le moment.</p>
                <p className="text-sm text-gray-400 mt-1">Vos statistiques apparaîtront ici d'ici peu.</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm shadow-gray-200/50 overflow-hidden flex flex-col">
          <div className="p-7 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">
                <ExclamationTriangleIcon className="w-6 h-6" />
              </div>
              Alertes Stock
            </h2>
          </div>
          <div className="p-7 flex-1 flex flex-col">
            {stats?.lowStock && stats.lowStock.length > 0 ? (
              <div className="space-y-4 flex-1">
                {stats.lowStock.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-3 border border-rose-100/50 rounded-2xl bg-rose-50/30">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-rose-400 flex-shrink-0">
                      <ShoppingBagIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div> Critique
                        </span>
                        <span className="text-xs text-rose-400 font-bold">{product.stockQuantity} restants</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 mt-auto border-t border-gray-50">
                  <Link to="/vendor/products" className="flex items-center justify-center w-full py-3 bg-gray-900 hover:bg-gray-800 rounded-xl text-sm font-bold text-white transition-colors shadow-lg shadow-gray-900/20">
                    Gérer l'inventaire
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                  <CheckIcon className="w-10 h-10 text-emerald-400" />
                </div>
                <p className="text-gray-900 font-bold text-lg">Tout est parfait</p>
                <p className="text-sm text-gray-500 mt-1">Tous vos produits sont en stock.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Access Pro Banner */}
      <div className="mt-8 relative overflow-hidden bg-gradient-to-r from-orange-400 via-orange-500 to-rose-500 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl shadow-orange-500/20 flex flex-col md:flex-row items-center justify-between gap-8 z-10 border border-white/10">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white opacity-10 rounded-full blur-3xl mix-blend-overlay pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-yellow-300 opacity-20 rounded-full blur-2xl mix-blend-overlay pointer-events-none transform -translate-x-1/2 translate-y-1/2" />
        
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-inner border border-white/20">
            <SparklesIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight text-white drop-shadow-md">Développez votre activité !</h3>
            <p className="text-white/80 text-sm mt-1 font-medium max-w-md">Ajoutez plus d'articles à votre catalogue et touchez des milliers de nouveaux clients potentiels dès aujourd'hui.</p>
          </div>
        </div>
        <div className="relative z-10 flex flex-wrap gap-4 w-full md:w-auto">
          <Link 
            to="/vendor/products" 
            className="flex-1 md:flex-none px-6 py-3.5 border-2 border-white/20 hover:bg-white/10 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <ListBulletIcon className="w-5 h-5" /> Mon Inventaire
          </Link>
          <Link 
            to="/vendor/products/add" 
            className="flex-1 md:flex-none px-8 py-3.5 bg-white text-orange-600 hover:bg-gray-50 rounded-xl font-black shadow-xl shadow-black/10 text-sm transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-5 h-5" /> Nouveau Produit
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;

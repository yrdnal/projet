import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../store/slices/orderSlice';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  InboxIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { useNavigate, Link } from 'react-router-dom';
import { formatPrice } from '../../utils/currency';
import { useTranslation } from '../../utils/i18n_simple';
import { getImageUrl } from '../../utils/url';

const VendorOrders = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading } = useSelector((state) => state.orders);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      dispatch(fetchOrders());
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: { icon: <ClockIcon className="w-4 h-4" />, text: t('order.status_pending') || 'En attente', classes: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
      processing: { icon: <ClockIcon className="w-4 h-4" />, text: t('order.status_processing') || 'En cours', classes: 'bg-blue-50 text-blue-700 border-blue-100' },
      shipped: { icon: <TruckIcon className="w-4 h-4" />, text: t('order.status_shipped') || 'Expédié', classes: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
      delivered: { icon: <CheckCircleIcon className="w-4 h-4" />, text: t('order.status_delivered') || 'Livré', classes: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
      cancelled: { icon: <XCircleIcon className="w-4 h-4" />, text: t('order.status_cancelled') || 'Annulé', classes: 'bg-rose-50 text-rose-700 border-rose-100' },
    };
    const config = configs[status?.toLowerCase()] || configs.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.classes} shadow-sm`}>
        {config.icon}{config.text}
      </span>
    );
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen bg-gray-50 flex items-center justify-center p-8 rounded-3xl" />;

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="max-w-screen-2xl mx-auto pb-12">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-[#0A0F1C] rounded-[2.5rem] p-8 md:p-12 mb-10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/5">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-emerald-500/20 to-transparent rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-orange-500/10 to-transparent rounded-full blur-[60px] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white/80 text-xs font-bold uppercase tracking-widest mb-4 border border-white/10">
             <InboxIcon className="w-4 h-4 text-emerald-400" /> Ventes & Expéditions
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Gestion des <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Commandes</span></h1>
          <p className="text-sm text-gray-400 mt-3 font-medium">Suivez les achats de vos clients, gérez les expéditions et communiquez facilement.</p>
        </div>
        
        <div className="relative z-10">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par ID..."
              className="pl-11 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none w-full sm:w-64 md:w-72 shadow-inner backdrop-blur-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-4 scrollbar-hide">
        {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-6 py-2.5 rounded-full text-xs font-bold capitalize transition-all whitespace-nowrap shadow-sm ${
              filter === tab 
                ? 'bg-gray-900 text-white shadow-md shadow-gray-900/20 transform -translate-y-0.5' 
                : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-800 border border-gray-200'
            }`}
          >
            {tab === 'all' ? t('nav.all') : t(`dashboard.${tab}`) || tab}
            {filter === tab && <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">{filteredOrders.length}</span>}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-dashed border-gray-200 p-16 md:p-24 text-center shadow-sm">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <InboxIcon className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">Aucune commande</h3>
          <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto">
            {filter === 'all' ? "Lorsque les clients achèteront vos produits, leurs commandes apparaîtront ici." : `Aucune commande trouvée avec le statut sélectionné.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="group bg-white rounded-[2rem] border border-gray-100 shadow-sm shadow-gray-200/50 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col lg:flex-row">
                {/* Meta info block */}
                <div className="p-8 lg:w-[320px] bg-gradient-to-br from-gray-50 to-white border-b lg:border-b-0 lg:border-r border-gray-100 space-y-6 relative overflow-hidden">
                  {/* Subtle decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100/50 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                  
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('order.id')}</span>
                    <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">#{order.id.slice(-8).toUpperCase()}</span>
                  </div>
                  
                  <div className="relative z-10">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">{t('order.customer')}</span>
                    <p className="text-[15px] font-black text-gray-900">{order.customerName}</p>
                    <p className="text-xs font-bold text-gray-500 truncate mt-0.5">{order.customerEmail}</p>
                  </div>
                  
                  <div className="relative z-10">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">{t('order.date')}</span>
                    <p className="text-sm font-bold text-gray-700">{new Date(order.createdAt).toLocaleDateString()} à {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                  
                  <div className="relative z-10 pt-4 border-t border-gray-200/50">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">{t('order.revenue')}</span>
                    <p className="text-2xl font-black text-orange-600">{formatPrice(order.total)}</p>
                  </div>
                </div>

                {/* Status and Items block */}
                <div className="flex-1 p-8 flex flex-col justify-between bg-white relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    {getStatusBadge(order.status)}

                    <div className="flex flex-wrap items-center gap-3">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/30 transform hover:-translate-y-0.5"
                        >
                          <CheckBadgeIcon className="w-4 h-4" strokeWidth={2.5} /> Approuver
                        </button>
                      )}
                      {order.customerId && (
                        <button
                          onClick={() => navigate('/messages', { state: { otherUserId: order.customerId } })}
                          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all border border-indigo-100"
                        >
                          <ChatBubbleBottomCenterTextIcon className="w-4 h-4" strokeWidth={2.5} /> Contacter
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-auto">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-3 overflow-hidden p-1">
                        {order.items?.map((item, i) => (
                          <div key={i} className="inline-block relative h-12 w-12 rounded-xl bg-gray-50 ring-4 ring-white shadow-sm overflow-hidden z-[4] last:z-[5]">
                            <img
                              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                              src={getImageUrl(item.product?.images?.[0]?.imageUrl)}
                              alt={item.product?.name || "Product"}
                              onError={(e) => { 
                                e.target.onerror = null; 
                                e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22150%22%20height%3D%22150%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23f3f4f6%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20fill%3D%22%239ca3af%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E'; 
                              }}
                            />
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <div className="flex items-center justify-center relative h-12 w-12 rounded-xl bg-orange-50 ring-4 ring-white text-[11px] font-black text-orange-600 shadow-sm z-[10] border border-orange-100">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-bold text-gray-500 hidden sm:inline-block">Contient {order.items?.length || 0} article(s)</span>
                    </div>
                    
                    <Link
                      to={`/vendor/orders/${order.id}`}
                      className="group/btn flex items-center gap-2 bg-gray-900 hover:bg-orange-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-gray-900/20 hover:shadow-orange-500/30"
                    >
                      Détails de la commande <ChevronRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorOrders;

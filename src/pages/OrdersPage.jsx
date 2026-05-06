import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  ShoppingBagIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  ArchiveBoxIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from '../utils/i18n_simple';
import { formatPrice } from '../utils/currency';
import { getImageUrl } from '../utils/url';

const OrdersPage = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data.data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return { color: 'text-green-600', icon: <CheckCircleIcon className="w-5 h-5" />, text: 'Livré' };
      case 'shipped':
        return { color: 'text-blue-600', icon: <TruckIcon className="w-5 h-5" />, text: 'En cours de livraison' };
      case 'processing':
        return { color: 'text-orange-500', icon: <ClockIcon className="w-5 h-5" />, text: 'En préparation' };
      default:
        return { color: 'text-gray-500', icon: <ArchiveBoxIcon className="w-5 h-5" />, text: 'En attente' };
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-[#EAEDED] pb-24">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <Link to="/profile" className="hover:underline">{t('nav.profile')}</Link>
              <span>›</span>
              <span className="text-orange-600 font-bold">{t('nav.orders')}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">{t('nav.orders')}</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full sm:w-80">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Rechercher toutes les commandes" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-400 outline-none"
              />
            </div>
            <button className="w-full sm:w-auto px-6 py-2 bg-[#37475A] hover:bg-[#232f3e] text-white text-sm font-bold rounded-lg shadow-sm transition-all whitespace-nowrap">
              Rechercher
            </button>
          </div>
        </div>

        {/* Filters Tabs */}
        <div className="flex border-b border-gray-300 mb-8 overflow-x-auto">
          {['Commandes', 'Acheter à nouveau', 'Pas encore expédié', 'Annulé'].map((tab, i) => (
            <button 
              key={tab} 
              className={`px-6 py-3 text-sm font-semibold transition-all whitespace-nowrap border-b-2 ${i === 0 ? 'text-gray-900 border-orange-500' : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-20 text-center">
              <ShoppingBagIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-bold">Vous n'avez pas encore passé de commande.</p>
              <Link to="/products" className="text-blue-600 text-sm hover:underline mt-2 inline-block">Commencer mes achats maintenant</Link>
            </div>
          ) : (
            orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-fadeIn">
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 flex flex-wrap gap-x-12 gap-y-4 border-b border-gray-100">
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Commande effectuée</p>
                      <p className="text-sm font-semibold text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total</p>
                      <p className="text-sm font-semibold text-gray-700">{formatPrice(order.total)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Envoyer à</p>
                      <div className="group relative">
                        <p className="text-sm font-semibold text-blue-600 cursor-pointer flex items-center gap-1">
                          {user?.firstName} {user?.lastName}
                          <ChevronRightIcon className="w-3 h-3 rotate-90" />
                        </p>
                      </div>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Commande n° {order.id?.slice(-8)}</p>
                      <div className="flex gap-4 text-xs text-blue-600 font-semibold uppercase tracking-wider">
                        <Link to={`/orders/${order.id}`} className="hover:text-orange-600 hover:underline">Voir les détails</Link>
                        <span className="text-gray-200">|</span>
                        <a href="#" className="hover:text-orange-600 hover:underline">Facture</a>
                      </div>
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Products column */}
                      <div className="flex-1 space-y-6">
                        <div className={`flex items-center gap-2 font-extrabold ${statusInfo.color}`}>
                          {statusInfo.icon}
                          <span className="text-lg">{statusInfo.text}</span>
                        </div>

                        {order.items?.map((item) => (
                          <div key={item.id} className="flex gap-4">
                            <div className="w-24 h-24 bg-gray-50 rounded-lg border border-gray-100 flex-shrink-0">
                              <img 
                                src={getImageUrl(item.product?.images?.[0]?.imageUrl)} 
                                className="w-full h-full object-contain p-2 mix-blend-multiply" 
                              />
                            </div>
                            <div className="flex-1">
                              <Link to={`/products/${item.productId}`} className="text-sm font-bold text-blue-600 hover:text-orange-600 transition-colors line-clamp-2 leading-snug mb-1">
                                {item.product?.name}
                              </Link>
                              <p className="text-xs text-gray-500 mb-2">Retour impossible après le 24 août 2024</p>
                              <div className="flex gap-3">
                                <Link 
                                  to={`/products/${item.productId}`}
                                  className="px-6 py-1.5 bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 text-xs font-bold rounded-full shadow-sm transition-all flex items-center gap-2"
                                >
                                  <ArrowPathIcon className="w-3.5 h-3.5" /> Acheter à nouveau
                                </Link>
                                <button className="px-6 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-full shadow-sm transition-all">
                                  Voir l'article
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Actions column */}
                      <div className="w-full md:w-56 space-y-2">
                        <Link to={`/orders/${order.id}`} className="block w-full py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-lg shadow-sm transition-all text-center">
                          Suivre le colis
                        </Link>
                        <Link to={`/orders/${order.id}`} className="block w-full py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-lg shadow-sm transition-all text-center">
                          Laisser un avis vendeur
                        </Link>
                        <Link to={`/orders/${order.id}`} className="block w-full py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-lg shadow-sm transition-all text-center">
                          Écrire un avis produit
                        </Link>
                        <Link to={`/orders/${order.id}`} className="block w-full py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-lg shadow-sm transition-all text-center">
                          Archiver la commande
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

export default OrdersPage;

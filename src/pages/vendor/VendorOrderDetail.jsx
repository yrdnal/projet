import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  ChevronLeftIcon, 
  MapPinIcon, 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  CheckBadgeIcon,
  TruckIcon,
  XCircleIcon,
  PrinterIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { formatPrice } from '../../utils/currency';
import { useTranslation } from '../../utils/i18n_simple';
import { getImageUrl } from '../../utils/url';

const VendorOrderDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.data);
    } catch {
      alert("Impossible de charger les détails de la commande.");
      navigate('/vendor/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await api.patch(`/orders/${id}/status`, { status: newStatus });
      await fetchOrder();
    } catch {
      alert("Échec de la mise à jour du statut.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen bg-gray-50 flex items-center justify-center p-8 rounded-3xl" />;
  if (!order) return null;

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-fadeIn">
      {/* Top Navigation */}
      <div className="mb-6">
        <Link to="/vendor/orders" className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-bold text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-200 shadow-sm transition-all">
          <ChevronLeftIcon className="w-4 h-4" strokeWidth={3} /> Retour
        </Link>
      </div>

      {/* Premium Header Summary */}
      <div className="relative overflow-hidden bg-[#0A0F1C] rounded-[2.5rem] p-8 md:p-12 mb-10 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border border-white/5">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-blue-500/20 to-transparent rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-[60px] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              Commande <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">#{order.id?.slice(-8).toUpperCase()}</span>
            </h1>
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
              order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
              order.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100' :
              'bg-blue-50 text-blue-700 border-blue-100'
            }`}>
              {t(`order.status_${order.status}`) || order.status}
            </span>
          </div>
          <p className="text-gray-400 font-medium flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-gray-500" /> Passée le {new Date(order.createdAt).toLocaleDateString()} à {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </p>
        </div>
        
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3.5 rounded-2xl border border-white/20 bg-white/5 text-sm font-bold text-white hover:bg-white/10 backdrop-blur-sm transition-all shadow-inner">
            <PrinterIcon className="w-5 h-5" /> Facture
          </button>
          {order.status === 'pending' && (
            <button 
              onClick={() => handleStatusUpdate('confirmed')}
              disabled={updating}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/30 transition-transform duration-300 transform hover:-translate-y-1"
            >
              <CheckBadgeIcon className="w-5 h-5" /> Approuver 
            </button>
          )}
          {order.status === 'confirmed' && (
            <button 
              onClick={() => handleStatusUpdate('shipped')}
              disabled={updating}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-blue-500/30 transition-transform duration-300 transform hover:-translate-y-1"
            >
              <TruckIcon className="w-5 h-5" /> Expédier
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Items & Payment */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm shadow-gray-200/50">
            <div className="p-8 border-b border-gray-50 bg-gray-50/30">
              <h3 className="text-xl font-black text-gray-900">Articles commandés</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items?.map((item) => (
                <div key={item.id} className="p-8 flex items-center gap-6 hover:bg-gray-50/50 transition-colors group">
                  <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 shadow-inner flex-shrink-0">
                    <img src={getImageUrl(item.imageUrl)} alt={item.productName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{item.productName}</p>
                    <div className="flex items-center gap-3 mt-2">
                       <p className="text-sm font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">x{item.quantity}</p>
                       <p className="text-sm font-medium text-gray-500">{formatPrice(item.price)} / unité</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-orange-600">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Total Revenu</p>
              <p className="text-4xl md:text-5xl font-black text-gray-900 drop-shadow-sm">{formatPrice(order.total)}</p>
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm shadow-gray-200/50">
            <h3 className="text-xl font-black text-gray-900 mb-8">Informations financières</h3>
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100/50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Méthode de paiement</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm border border-orange-200">
                    <BanknotesIcon className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-gray-900 text-lg capitalize">{order.paymentMethod || 'Non spécifiée'}</p>
                </div>
              </div>
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100/50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Statut du Fonds</p>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm border ${
                  order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                }`}>
                  {order.paymentStatus === 'paid' ? <CheckBadgeIcon className="w-5 h-5"/> : <ClockIcon className="w-5 h-5"/>}
                  {order.paymentStatus || 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info */}
        <div className="space-y-8">
          {/* Buyer Profile */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm shadow-gray-200/50">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-500 rounded-xl"><UserIcon className="w-5 h-5" /></div>
              Profil Acheteur
            </h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-inner">
                  {(order.customerName?.[0] || '?').toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-gray-900 text-lg">{order.customerName}</p>
                  <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg w-fit mt-1">Client vérifié</p>
                </div>
              </div>
              <div className="space-y-4 pt-6 border-t border-gray-50">
                <div className="flex items-center gap-4 text-sm text-gray-600 font-medium p-3 bg-gray-50 rounded-xl">
                  <EnvelopeIcon className="w-5 h-5 text-indigo-400" /> {order.customerEmail}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 font-medium p-3 bg-gray-50 rounded-xl">
                  <PhoneIcon className="w-5 h-5 text-indigo-400" /> {order.customerPhone || 'Non renseigné'}
                </div>
              </div>
              <button 
                onClick={() => navigate('/messages', { state: { otherUserId: order.customerId } })}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 hover:bg-indigo-600 text-white text-sm font-bold rounded-2xl transition-all shadow-xl shadow-gray-900/20 transform hover:-translate-y-1"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" /> Message Direct
              </button>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm shadow-gray-200/50">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><MapPinIcon className="w-5 h-5" /></div>
              Logistique
            </h3>
            <div className="space-y-1">
              <p className="font-black text-gray-900 text-lg mb-2">{order.shippingAddress?.fullName || order.customerName}</p>
              <p className="text-gray-600 font-medium leading-relaxed">{order.shippingAddress?.address}</p>
              <p className="text-gray-600 font-medium leading-relaxed">{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
              <p className="text-gray-600 font-medium leading-relaxed">{order.shippingAddress?.country}</p>
              
              <div className="mt-6 pt-6 border-t border-gray-50">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Instructions du client</p>
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
                   <p className="text-sm text-gray-600 italic">"Généralement sans instructions spéciales sauf indication contraire."</p>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-8 bg-rose-50 rounded-[2rem] border border-rose-100">
            <h4 className="text-xs font-black text-rose-700 uppercase tracking-widest mb-4 flex items-center gap-2">
              <XCircleIcon className="w-5 h-5" /> Zone de danger
            </h4>
            <button 
              onClick={() => handleStatusUpdate('cancelled')}
              disabled={updating || order.status === 'cancelled' || order.status === 'delivered'}
              className="w-full py-4 bg-white border border-rose-200 text-rose-600 text-xs font-black rounded-xl hover:bg-rose-600 hover:text-white transition-all uppercase tracking-widest shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler la vente
            </button>
            <p className="text-[10px] text-rose-500/80 mt-4 leading-relaxed font-bold">
              Attention: l'annulation d'une commande affecte votre taux de satisfaction. Ne l'utilisez qu'en dernier recours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorOrderDetail;

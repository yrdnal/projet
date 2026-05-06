import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById, cancelOrder } from '../store/slices/orderSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { CheckCircleIcon, TruckIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { formatPrice } from '../utils/currency';
import { useTranslation } from '../utils/i18n_simple';
import { getImageUrl, PLACEHOLDER_IMAGE } from '../utils/url';

const OrderDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentOrder: order, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrderById(id));
  }, [id, dispatch]);

  const handleCancelOrder = async () => {
    if (window.confirm(t('common.confirm_action') || 'Êtes-vous sûr de vouloir annuler cette commande ?')) {
      try {
        await dispatch(cancelOrder(id)).unwrap();
        alert(t('common.success_msg') || 'Commande annulée avec succès');
      } catch (error) {
        alert(error || t('common.error_msg') || 'Échec de l\'annulation de la commande');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled',
    };
    return statusClasses[status] || 'badge badge-gray';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircleIcon className="w-6 h-6 text-green-600" />;
      case 'shipped':
        return <TruckIcon className="w-6 h-6 text-blue-600" />;
      case 'cancelled':
        return <XCircleIcon className="w-6 h-6 text-red-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-screen" />;
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
          <button onClick={() => navigate('/orders')} className="btn btn-primary">
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Success Message */}
        {location.state?.message && (
          <div className="alert alert-success mb-6 animate-slideUp">
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            {location.state.message}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="heading-2 mb-2">Order #{order.id}</h1>
            <p className="text-gray-600">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {getStatusIcon(order.status)}
            <span className={getStatusBadge(order.status)}>
              {t(`order.status_${order.status}`) || (order.status.charAt(0).toUpperCase() + order.status.slice(1))}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">{t('nav.products')}</h2>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <img
                      src={getImageUrl(item.imageUrl)}
                      alt={item.productName}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.price)} x {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {formatPrice(parseFloat(item.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">{t('checkout.shipping_info')}</h2>
              <div className="text-gray-600">
                <p>{order.shippingAddress?.address}</p>
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                </p>
                <p>{order.shippingAddress?.country}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">{t('checkout.payment_method')}</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium capitalize">
                    {order.paymentMethod || 'Card'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                    {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-6">{t('checkout.order_summary')}</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {formatPrice(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">
                    {order.shippingCost === 0 ? t('common.free_shipping') : formatPrice(order.shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">
                    {formatPrice(order.tax)}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-black text-orange-600">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {order.status === 'pending' && (
                  <button
                    onClick={handleCancelOrder}
                    className="btn btn-danger w-full"
                  >
                    Annuler la commande
                  </button>
                )}
                <button
                  onClick={() => navigate('/orders')}
                  className="btn btn-secondary w-full"
                >
                  {t('nav.returns_orders')}
                </button>
              </div>

              {/* Order Timeline */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-4">Order Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3"></div>
                    <div>
                      <p className="font-medium text-sm">Order Placed</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {order.status !== 'pending' && (
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3"></div>
                      <div>
                        <p className="font-medium text-sm">Order {order.status}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;

// Made with Bob

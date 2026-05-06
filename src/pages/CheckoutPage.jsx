import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { clearCart } from '../store/slices/cartSlice';
import { createOrder } from '../store/slices/orderSlice';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  MapPinIcon,
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { ShieldCheckIcon as ShieldCheckIconSolid } from '@heroicons/react/24/solid';
import { useTranslation } from '../utils/i18n_simple';
import { formatPrice } from '../utils/currency';
import { getImageUrl } from '../utils/url';

const CheckoutPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, totalPrice } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    city: 'Antananarivo',
    phone: '',
    paymentMethod: 'mpaisa', // Default to common Malagasy payment
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product?.discountPrice || item.product?.price
        })),
        totalAmount: totalPrice,
        shippingAddress: {
          fullName: `${user?.firstName} ${user?.lastName}`,
          phone: formData.phone,
          addressLine1: formData.address,
          city: formData.city,
          province: formData.city,
          postalCode: '101',
          country: 'Madagascar'
        },
        paymentMethod: formData.paymentMethod
      };

      const result = await dispatch(createOrder(orderData)).unwrap();
      dispatch(clearCart());
      navigate(`/orders/${result.data.id}`, { state: { success: true } });
    } catch (err) {
      alert('Échec de la commande : ' + (err || 'Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EAEDED]">
        <div className="text-center">
          <p className="text-xl mb-4">Your cart is empty.</p>
          <Link to="/products" className="text-orange-600 font-bold hover:underline">Go back to shopping</Link>
        </div>
      </div>
    );
  }

  const StepHeader = ({ num, title, active }) => (
    <div className={`flex items-center gap-2 ${active ? 'text-gray-900' : 'text-gray-400'}`}>
      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${active ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-300'}`}>
        {num}
      </span>
      <span className="font-bold text-sm hidden sm:inline">{title}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#EAEDED] pb-24">
      {/* Checkout Navbar */}
      <nav className="bg-white border-b border-gray-200 py-4 mb-8">
        <div className="max-w-screen-2xl mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#131921] rounded flex items-center justify-center">
              <span className="text-orange-400 font-extrabold text-sm">M</span>
            </div>
            <span className="text-[#131921] font-extrabold text-lg hidden md:inline">MalagasyShop</span>
          </Link>

          <div className="flex items-center gap-4 sm:gap-12">
            <StepHeader num={1} title={t('checkout.shipping')} active={step >= 1} />
            <span className="text-gray-200 hidden sm:inline">———</span>
            <StepHeader num={2} title={t('checkout.payment')} active={step >= 2} />
            <span className="text-gray-200 hidden sm:inline">———</span>
            <StepHeader num={3} title={t('checkout.review')} active={step >= 3} />
          </div>

          <div className="flex items-center gap-2 text-gray-400">
            <LockClosedIcon className="w-4 h-4" />
            <span className="text-[10px] hidden md:inline uppercase tracking-widest font-bold">{t('checkout.secure_ssl')}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="flex-1 space-y-6">
            {/* Step 1: Shipping */}
            <div className={`bg-white rounded-2xl border transition-all ${step === 1 ? 'border-orange-200 ring-1 ring-orange-100 shadow-md' : 'border-gray-200 opacity-60'}`}>
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-orange-500" />
                  {t('checkout.shipping_info')}
                </h2>
                {step > 1 && (
                  <button onClick={() => setStep(1)} className="text-blue-600 text-sm hover:underline">{t('order.update_status')}</button>
                )}
              </div>
              <div className={`p-6 ${step === 1 ? 'block' : 'hidden md:block'}`}>
                {step === 1 ? (
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 mb-1">{t('checkout.full_address')}</label>
                      <input 
                        type="text" name="address" value={formData.address} onChange={handleChange}
                        placeholder="Lot 123, quartier, building..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">{t('checkout.city')}</label>
                      <select name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm outline-none">
                        <option>Antananarivo</option>
                        <option>Toamasina</option>
                        <option>Antsirabe</option>
                        <option>Mahajanga</option>
                        <option>Fianarantsoa</option>
                        <option>Toliara</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">{t('checkout.phone')}</label>
                      <input 
                        type="text" name="phone" value={formData.phone} onChange={handleChange}
                        placeholder="+261 3x xx xxx xx"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-400 outline-none"
                      />
                    </div>
                    <div className="md:col-span-2 pt-4">
                      <button 
                        type="button" 
                        onClick={() => setStep(2)}
                        disabled={!formData.address || !formData.phone}
                        className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all disabled:opacity-50"
                      >
                        {t('checkout.continue_payment')}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-sm text-gray-600">
                    <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                    <p>{formData.address}, {formData.city}</p>
                    <p>Phone: {formData.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Payment */}
            <div className={`bg-white rounded-2xl border transition-all ${step === 2 ? 'border-orange-200 ring-1 ring-orange-100 shadow-md' : 'border-gray-200 opacity-60'}`}>
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <CreditCardIcon className="w-5 h-5 text-orange-500" />
                  {t('checkout.payment_method')}
                </h2>
                {step > 2 && (
                  <button onClick={() => setStep(2)} className="text-blue-600 text-sm hover:underline">{t('order.update_status')}</button>
                )}
              </div>
              <div className={`p-6 ${step === 2 ? 'block' : 'hidden'}`}>
                <div className="grid gap-3">
                  {[
                    { id: 'mpaisa', name: 'Mvola / Orange Money / Airtel Money', desc: 'Secure local mobile payment' },
                    { id: 'card', name: 'International Credit/Debit Card', desc: 'Visa, Mastercard, etc.' },
                    { id: 'cod', name: 'Cash on Delivery', desc: 'Pay when you receive the items' },
                  ].map(method => (
                    <label key={method.id} className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex gap-4 ${formData.paymentMethod === method.id ? 'border-orange-400 bg-orange-50 ring-1 ring-orange-200' : 'border-gray-100 hover:border-gray-300 bg-gray-50'}`}>
                      <input 
                        type="radio" name="paymentMethod" value={method.id} 
                        checked={formData.paymentMethod === method.id}
                        onChange={handleChange}
                        className="w-4 h-4 mt-1 text-orange-500 focus:ring-orange-400"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{method.name}</p>
                        <p className="text-xs text-gray-500">{method.desc}</p>
                      </div>
                      {method.id === 'cod' && <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded font-bold self-start">RECOMMENDED</span>}
                    </label>
                  ))}
                </div>
                <div className="pt-6">
                  <button 
                    onClick={() => setStep(3)}
                    className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all"
                  >
                    {t('checkout.review')}
                  </button>
                </div>
              </div>
              {step > 2 && (
                <div className="p-6 text-sm text-gray-600">
                  <p className="font-semibold uppercase text-gray-400 tracking-widest text-[10px] mb-1">Paying with</p>
                  <p className="font-bold text-gray-900">{formData.paymentMethod === 'mpaisa' ? 'Mobile Money' : formData.paymentMethod === 'card' ? 'Credit Card' : 'Cash on Delivery'}</p>
                </div>
              )}
            </div>

            {/* Step 3: Review */}
            <div className={`bg-white rounded-2xl border transition-all ${step === 3 ? 'border-orange-200 ring-1 ring-orange-100 shadow-md' : 'border-gray-200 opacity-60'}`}>
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <TruckIcon className="w-5 h-5 text-orange-500" />
                  {t('checkout.review_items')}
                </h2>
              </div>
              <div className={`p-6 ${step === 3 ? 'block' : 'hidden'}`}>
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="w-16 h-16 bg-white rounded border flex-shrink-0">
                        <img src={getImageUrl(typeof item.product?.images?.[0] === 'string' ? item.product.images[0] : item.product?.images?.[0]?.imageUrl || item.product?.images?.[0]?.url)} className="w-full h-full object-contain p-1" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.product?.name}</p>
                        <p className="text-xs text-orange-600 font-extrabold mt-1">{formatPrice(item.product?.discountPrice || item.product?.price)}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-[10px] text-gray-500">{t('common.quantity')}: {item.quantity}</p>
                          <p className="text-[10px] text-green-600 font-bold">{t('checkout.shipping')}: Mon, Oct 12</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Order Summary */}
          <div className="lg:w-96 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-8">
              <div className="p-6 bg-gray-50 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">{t('checkout.order_summary')}</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{t('nav.products')} ({items.length}):</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Livraison & frais:</span>
                    <span>{formatPrice(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>{t('checkout.free_shipping_promo')}:</span>
                    <span>-$0.00</span>
                  </div>
                </div>
                
                <hr className="border-gray-100" />
                
                <div className="flex justify-between items-baseline mb-6">
                  <p className="text-lg font-bold text-gray-900">{t('order.total')}:</p>
                  <p className="text-2xl font-extrabold text-[#131921]">{formatPrice(totalPrice)}</p>
                </div>

                <button 
                   disabled={step < 3 || loading}
                   onClick={handlePlaceOrder}
                   className="w-full py-4 bg-[#FFD814] hover:bg-[#F7CA00] disabled:opacity-50 text-gray-900 font-bold rounded-xl shadow-lg transition-all text-sm relative overflow-hidden group"
                 >
                   <span className={loading ? 'opacity-0' : 'opacity-100'}>{t('checkout.place_order')}</span>
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </button>

                <p className="text-[10px] text-gray-500 text-center leading-relaxed mt-4">
                  En passant votre commande, vous acceptez les <a href="#" className="underline">{t('checkout.privacy_notice')}</a> et les <a href="#" className="underline">{t('checkout.conditions_use')}</a> de MalagasyShop.
                </p>
              </div>

              <div className="p-6 bg-orange-50 border-t border-orange-100 flex gap-3">
                <ShieldCheckIconSolid className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-orange-700 font-bold uppercase tracking-widest">{t('checkout.protect_title')}</p>
                  <p className="text-[10px] text-orange-600 mt-0.5">{t('checkout.protect_desc')}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

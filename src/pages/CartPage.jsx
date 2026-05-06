import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../utils/i18n_simple';
import { removeFromCart, updateCartItem, clearCart } from '../store/slices/cartSlice';
import { formatPrice } from '../utils/currency';
import { getImageUrl } from '../utils/url';
import {
  TrashIcon,
  ShoppingBagIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ShieldCheckIcon as ShieldCheckIconSolid } from '@heroicons/react/24/solid';

const CartPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, totalPrice, loading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#EAEDED] py-16 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-200">
          <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBagIcon className="w-12 h-12 text-orange-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Votre panier est vide.</h1>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Découvrez nos dernières offres ou continuez vos achats pour trouver votre prochain coup de cœur !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/products"
              className="px-10 py-3 bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-bold rounded-lg transition-all shadow-sm"
            >
              Commencer mes achats
            </Link>
            {!isAuthenticated && (
              <Link 
                to="/login"
                className="px-10 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-lg transition-all"
              >
                Connectez-vous à votre compte
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleUpdateQuantity = (itemId, qty) => {
    if (qty < 1) return;
    dispatch(updateCartItem({ itemId, quantity: qty }));
  };

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  const subtotal = totalPrice || 0;
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#EAEDED] pb-24">
      <div className="max-w-screen-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Panier</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Items List */}
          <div className="flex-grow">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 hidden md:grid grid-cols-12 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <div className="col-span-8">Détails du produit</div>
                <div className="col-span-2 text-center">Quantité</div>
                <div className="col-span-2 text-right">Prix</div>
              </div>

              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="p-6 grid grid-cols-12 gap-4 items-center animate-fadeIn group">
                    {/* Info */}
                    <div className="col-span-12 md:col-span-8 flex gap-4">
                      <div className="w-20 h-20 md:w-28 md:h-28 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                        <img 
                          src={getImageUrl(typeof item.product?.images?.[0] === 'string' ? item.product.images[0] : item.product?.images?.[0]?.imageUrl || item.product?.images?.[0]?.url)} 
                          alt={item.product?.name} 
                          className="w-full h-full object-contain p-2 mix-blend-multiply"
                        />
                      </div>
                      <div className="flex flex-col justify-between py-1">
                        <div>
                          <Link to={`/products/${item.productId}`} className="text-lg font-bold text-gray-900 hover:text-orange-600 transition-colors line-clamp-1">
                            {item.product?.name}
                          </Link>
                          <p className="text-sm text-green-600 font-semibold mt-1 flex items-center gap-1">
                            <CheckCircleIcon className="w-4 h-4" /> {t('common.in_stock')}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">{t('common.sold_by')}: <span className="text-blue-600 hover:underline cursor-pointer">{t('common.seller_name')}</span></p>
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                          <button 
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 transition-colors"
                          >
                            <TrashIcon className="w-3.5 h-3.5" /> Supprimer
                          </button>
                          <span className="text-gray-200">|</span>
                          <button className="text-xs text-blue-600 hover:text-orange-600 font-semibold transition-colors">Enregistrer pour plus tard</button>
                        </div>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-6 md:col-span-2 flex flex-col items-center">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-gray-50 h-10 w-24">
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="flex-1 h-full hover:bg-gray-200 flex items-center justify-center transition-colors text-lg"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="flex-1 h-full hover:bg-gray-200 flex items-center justify-center transition-colors text-lg"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-6 md:col-span-2 text-right">
                      <p className="text-xl font-extrabold text-[#131921]">{formatPrice(parseFloat(item.product?.price || 0) * item.quantity)}</p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-gray-400 mt-1">{formatPrice(item.product?.price)} / unité</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center">
              <Link 
                to="/products"
                className="text-sm font-bold text-blue-600 hover:text-orange-600 flex items-center gap-2 group transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Continuer mes achats
              </Link>
              <button 
                onClick={() => dispatch(clearCart())}
                className="text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors"
              >
                Vider le panier
              </button>
            </div>
          </div>

          {/* Checkout Box */}
          <div className="lg:w-96 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6 sticky top-20">
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-green-800 font-bold">Votre commande est éligible à la livraison GRATUITE.</p>
                    <p className="text-[10px] text-green-700 mt-0.5">Sélectionnez cette option lors du paiement pour les articles répondant aux conditions minimales.</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <p className="text-lg font-bold text-gray-900">{t('cart.subtotal')} ({itemCount} {t('cart.items')}):</p>
                    <p className="text-2xl font-extrabold text-[#131921]">{formatPrice(subtotal)}</p>
                  </div>
                  <label className="flex items-center gap-2 mb-6 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-orange-400 focus:ring-orange-400" />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900">Cette commande contient un cadeau</span>
                  </label>
                  
                  <Link 
                    to="/checkout"
                    className="block w-full text-center py-3.5 bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-bold rounded-xl shadow-sm transition-all text-sm active:scale-[0.98]"
                  >
                    {t('cart.checkout')}
                  </Link>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-4">MalagasyShop Protection</h3>
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <ShieldCheckIconSolid className="w-5 h-5 text-gray-400" />
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {t('checkout.protect_desc')} <a href="#" className="text-blue-600 hover:underline">En savoir plus</a>
                    </p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <ExclamationCircleIcon className="w-5 h-5 text-gray-400" />
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Politique de retour : Éligible pour un retour dans les 30 jours suivant la réception.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;

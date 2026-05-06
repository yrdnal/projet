import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, fetchProducts } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProductCard from '../components/common/ProductCard';
import {
  StarIcon,
  ShoppingBagIcon,
  ShieldCheckIcon,
  TruckIcon,
  ArrowPathIcon,
  CheckIcon,
  QuestionMarkCircleIcon,
  ShareIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, ShieldCheckIcon as ShieldCheckIconSolid } from '@heroicons/react/24/solid';
import { useTranslation } from '../utils/i18n_simple';
import { formatPrice } from '../utils/currency';
import { getImageUrl } from '../utils/url';

const ProductDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProduct: product, products: relatedProducts, loading } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (product?.categoryId) {
      dispatch(fetchProducts({ category: product.categoryId, limit: 6 }));
    }
  }, [dispatch, product]);

  if (loading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EAEDED]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const images = product.images?.length > 0 
    ? product.images.map(img => {
        if (typeof img === 'string') return { imageUrl: getImageUrl(img) };
        return { ...img, imageUrl: getImageUrl(img.url || img.imageUrl) };
      })
    : [{ imageUrl: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22600%22%20height%3D%22600%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23f3f4f6%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20fill%3D%22%239ca3af%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ENo%20Image%20Available%3C%2Ftext%3E%3C%2Fsvg%3E' }];

  const inStock = product.stockQuantity > 0;
  const discount = product.discountPrice ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  const handleAddToCart = () => {
    dispatch(addToCart({ productId: product.id, quantity }));
  };

  const handleBuyNow = async () => {
    await dispatch(addToCart({ productId: product.id, quantity }));
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Breadcrumbs */}
      <nav className="bg-[#EAEDED] px-4 py-2 border-b border-gray-200">
        <div className="max-w-screen-2xl mx-auto flex items-center gap-2 text-xs text-gray-600">
          <Link to="/" className="hover:underline">{t('nav.home')}</Link>
          <span>›</span>
          <Link to="/products" className="hover:underline">{t('nav.products')}</Link>
          <span>›</span>
          <span className="text-gray-400 truncate max-w-xs">{product.name}</span>
        </div>
      </nav>

      <div className="max-w-screen-2xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Left: Image Gallery */}
          <div className="lg:w-1/2 flex flex-col md:flex-row gap-4">
            {/* Thumbnails */}
            <div className="order-2 md:order-1 flex md:flex-col gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onMouseEnter={() => setActiveImage(i)}
                  className={`w-12 h-12 md:w-16 md:h-16 rounded border-2 transition-all overflow-hidden ${activeImage === i ? 'border-orange-500 ring-1 ring-orange-500' : 'border-gray-200'}`}
                >
                  <img src={img.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            
            {/* Main Image */}
            <div className="order-1 md:order-2 flex-1 relative bg-gray-50 rounded-xl overflow-hidden group cursor-zoom-in min-h-[400px]">
              <img 
                src={images[activeImage]?.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-contain mix-blend-multiply"
              />
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button className="p-2.5 bg-white/80 backdrop-blur rounded-full shadow hover:bg-white text-gray-600 transition-colors">
                  <ShareIcon className="w-5 h-5" />
                </button>
                <button className="p-2.5 bg-white/80 backdrop-blur rounded-full shadow hover:bg-white text-gray-600 hover:text-red-500 transition-colors">
                  <HeartIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Center: Info */}
          <div className="lg:w-1/3 space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center text-orange-400">
                  <StarIconSolid className="w-4 h-4" />
                  <StarIconSolid className="w-4 h-4" />
                  <StarIconSolid className="w-4 h-4" />
                  <StarIconSolid className="w-4 h-4" />
                  <StarIcon className="w-4 h-4" />
                  <span className="ml-1 text-blue-600 hover:text-orange-600 cursor-pointer">48 avis</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-blue-600 hover:text-orange-600 cursor-pointer">12 questions répondues</span>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-orange-600 text-3xl font-black">
                  {formatPrice(product.discountPrice || product.price)}
                </span>
                {product.discountPrice && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 line-through text-sm">Prix initial: {formatPrice(product.price)}</span>
                    <span className="text-orange-600 text-sm font-bold">-{discount}%</span>
                  </div>
                )}
              </div>
              
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-orange-900">Choix de MalagasyShop</p>
                  <p className="text-xs text-orange-700">produits hautement notés, bien tarifés et disponibles immédiatement</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-gray-900 mb-2">{t('common.about_item')}</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {product.description || 'Aucune description disponible pour ce produit.'}
              </p>
              <ul className="mt-4 space-y-1.5 list-disc list-inside text-sm text-gray-600">
                <li>Qualité authentique de vendeurs réputés</li>
                <li>Livraison rapide dans tout Madagascar</li>
                <li>Garantie de remboursement à 100%</li>
                <li>Méthodes de paiement sécurisées prises en charge</li>
              </ul>
            </div>
          </div>

          {/* Right: Checkout Box */}
          <div className="lg:w-1/6">
            <div className="sticky top-20 border border-gray-200 rounded-xl p-6 space-y-6 shadow-sm">
              <div className="space-y-1">
                <span className="text-2xl font-black text-gray-900">{formatPrice(product.discountPrice || product.price)}</span>
                <p className="text-xs text-gray-500">Toutes taxes comprises (TTC)</p>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-green-600 font-bold">{t('common.in_stock')}</p>
                <p className="flex items-center gap-1.5 text-gray-700">
                  <TruckIcon className="w-4 h-4 text-gray-400" />
                  Livraison rapide en 1-3 jours
                </p>
                <div className="flex gap-2">
                  <span className="text-gray-500">{t('common.ships_from')}</span>
                  <span className="font-semibold">MalagasyShop</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500">{t('common.sold_by')}</span>
                  <span className="font-semibold text-blue-600 hover:text-orange-600 cursor-pointer">
                    {product.vendor?.firstName || 'Vendeur Local'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {inStock ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">{t('common.quantity')}</label>
                      <select 
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2 outline-none focus:ring-1 focus:ring-orange-400"
                      >
                        {[...Array(Math.min(product.stockQuantity, 10))].map((_, i) => (
                          <option key={i+1} value={i+1}>{i+1}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <button 
                        onClick={handleAddToCart}
                        className="w-full py-2.5 border border-orange-400 bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-semibold rounded-full shadow-sm transition-all text-sm"
                      >
                        {t('common.add_to_cart')}
                      </button>
                      <button 
                        onClick={handleBuyNow}
                        className="w-full py-2.5 bg-[#FFA41C] hover:bg-[#FA8914] text-gray-900 font-semibold rounded-full shadow-sm transition-all text-sm"
                      >
                        {t('common.buy_now')}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
                    <p className="text-red-700 font-bold">{t('common.out_of_stock')}</p>
                    <p className="text-[10px] text-red-600 mt-1">Nous ne savons pas quand cet article sera de nouveau en stock.</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-3">
                <button className="flex items-center gap-2 text-xs text-blue-600 hover:text-orange-600 transition-colors font-bold">
                  <HeartIcon className="w-4 h-4" />
                  {t('common.add_to_list')}
                </button>
                <div className="flex items-start gap-2 text-[10px] text-gray-500">
                  <ShieldCheckIconSolid className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{t('common.secure_transaction')}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Related Products */}
        <section className="mt-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Similar products you might like</h2>
            <Link to="/products" className="text-sm text-blue-600 hover:text-orange-500 font-semibold">See all items</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {relatedProducts?.filter(p => p.id !== product.id).slice(0, 6).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetailPage;

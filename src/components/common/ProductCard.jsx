import { Link } from 'react-router-dom';
import { ShoppingCartIcon, StarIcon, HeartIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useTranslation } from '../../utils/i18n_simple';
import { getImageUrl } from '../../utils/url';
import { formatPrice } from '../../utils/currency';

const ProductCard = ({ product, onAddToCart }) => {
  const { t } = useTranslation();
  const getFirstImage = (product) => {
    if (product.primaryImage) return product.primaryImage;
    if (!product.images || product.images.length === 0) return null;
    const first = product.images[0];
    return typeof first === 'string' ? first : (first.imageUrl || first.url);
  };
  const imageUrl = getImageUrl(getFirstImage(product));
  const rating = product.averageRating || 0;
  const reviewCount = product.reviewCount || 0;
  const inStock = (product.stockQuantity ?? product.stock ?? 0) > 0;
  const lowStock = (product.stockQuantity ?? product.stock ?? 0) < 10 && inStock;
  const hasDiscount = product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price);
  const discountPct = hasDiscount
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.compareAtPrice)) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart && inStock) onAddToCart(product);
  };

  return (
    <Link to={`/products/${product.id}`} className="group block bg-white rounded-lg border border-gray-200 hover:shadow-xl hover:border-orange-300 transition-all duration-300 overflow-hidden">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-52 object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { 
            e.target.onerror = null;
            e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22150%22%20height%3D%22150%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23f3f4f6%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20fill%3D%22%239ca3af%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E'; 
          }}
        />
        {!inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <span className="bg-white text-gray-700 font-semibold text-sm px-3 py-1 rounded-full">{t('common.out_of_stock')}</span>
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-2 left-2">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">-{discountPct}%</span>
          </div>
        )}
        {lowStock && inStock && (
          <div className="absolute top-2 right-2">
            <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-1 rounded">{t('common.low_stock')}</span>
          </div>
        )}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
          title={t('common.add_to_list')}
        >
          <HeartIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-orange-600 font-medium uppercase tracking-wide mb-1">{product.categoryName || 'General'}</p>
        <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">{product.name}</h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star}>
                {star <= Math.round(rating)
                  ? <StarIconSolid className="w-3.5 h-3.5 text-yellow-400" />
                  : <StarIcon className="w-3.5 h-3.5 text-gray-300" />}
              </span>
            ))}
          </div>
          <span className="text-xs text-blue-600 hover:text-orange-600 ml-1">({reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-black text-gray-900">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="text-xs text-gray-500 line-through mb-0.5">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Shipping badge */}
        <p className="text-xs text-gray-500 mb-3">
          {parseFloat(product.price) >= 100000
            ? <span className="text-blue-600 font-medium">{t('common.free_shipping')}</span>
            : 'Livraison standard'}
        </p>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`w-full py-2 px-4 rounded-full text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            inStock
              ? 'bg-orange-400 hover:bg-orange-500 text-white shadow-md hover:shadow-lg active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <ShoppingCartIcon className="w-4 h-4" />
          {inStock ? t('common.add_to_cart') : t('common.out_of_stock')}
        </button>

        {product.vendorName && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            {t('common.sold_by')} <span className="font-medium text-blue-600">{product.vendorName}</span>
          </p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;

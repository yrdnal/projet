import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import ProductCard from '../components/common/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useTranslation } from '../utils/i18n_simple';

const getSortOptions = (t) => [
  { label: t('sort.featured'), value: 'created_at:desc' },
  { label: t('sort.price_asc'), value: 'price:asc' },
  { label: t('sort.price_desc'), value: 'price:desc' },
  { label: t('sort.newest'), value: 'created_at:desc' },
];


const ProductsPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const sortOptions = getSortOptions(t);
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, categories, total, loading } = useSelector((state) => state.products);
  
  const [view, setView] = useState('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filters state
  const query = searchParams.get('search') || '';
  const categoryId = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sortBy = searchParams.get('sortBy') || 'created_at';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProducts({
      search: query,
      category: categoryId,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      limit: 20
    }));
  }, [dispatch, query, categoryId, minPrice, maxPrice, sortBy, sortOrder]);

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (e) => {
    const [by, order] = e.target.value.split(':');
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', by);
    newParams.set('sortOrder', order);
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-[#EAEDED] pb-12">
      {/* Results Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{total || 0}</span> résultats pour 
              <span className="text-orange-600 font-bold ml-1">"{query || 'Tous les produits'}"</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* View Switch */}
            <div className="hidden md:flex bg-gray-100 rounded-lg p-1">
              <button 
                onClick={() => setView('grid')}
                className={`p-1.5 rounded-md transition-all ${view === 'grid' ? 'bg-white shadow-sm text-orange-500' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setView('list')}
                className={`p-1.5 rounded-md transition-all ${view === 'list' ? 'bg-white shadow-sm text-orange-500' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Bars3Icon className="w-5 h-5" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative group">
              <select 
                value={`${sortBy}:${sortOrder}`}
                onChange={handleSortChange}
                className="appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full pl-3 pr-8 py-1.5 cursor-pointer outline-none hover:bg-gray-100 transition-colors"
              >
                {sortOptions.map(opt => (
                  <option key={`${opt.label}-${opt.value}`} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDownIcon className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button 
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden p-2 bg-gray-100 rounded-lg text-gray-700"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="space-y-8">
              {/* Categories */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Rayon</h3>
                <ul className="space-y-2">
                  <li>
                    <button 
                      onClick={() => handleFilterChange('category', '')}
                      className={`text-sm hover:text-orange-600 transition-colors ${!categoryId ? 'font-bold text-orange-600' : 'text-gray-600'}`}
                    >
                      Tous les rayons
                    </button>
                  </li>
                  {categories?.map(cat => (
                    <li key={cat.id}>
                      <button 
                        onClick={() => handleFilterChange('category', cat.id)}
                        className={`text-sm hover:text-orange-600 text-left transition-colors ${categoryId === String(cat.id) ? 'font-bold text-orange-600' : 'text-gray-600'}`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Customer Reviews */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Avis Clients</h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map(stars => (
                    <button key={stars} className="flex items-center gap-1 group text-sm text-gray-600 hover:text-orange-600 transition-colors">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <StarIconSolid key={i} className={`w-4 h-4 ${i < stars ? 'text-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <span className="ml-1 group-hover:underline">et plus</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Prix</h3>
                <div className="flex items-center gap-2 mb-4">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold">Ar</span>
                    <input 
                      type="number" 
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
                    />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold">Ar</span>
                    <input 
                      type="number" 
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
                    />
                  </div>
                </div>
              </div>

              {/* Clear filters */}
              <button 
                onClick={clearFilters}
                className="w-full py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-white transition-colors"
              >
                Effacer les filtres
              </button>
            </div>
          </aside>

          {/* Product Grid */}
          <section className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <LoadingSpinner size="lg" />
              </div>
            ) : products?.length > 0 ? (
              <div className={view === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "flex flex-col gap-4"
              }>
                {products.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    layout={view}
                    onAddToCart={() => dispatch(addToCart({ productId: product.id, quantity: 1 }))}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 py-32 text-center">
                <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Aucun résultat trouvé</h2>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                  Essayez d'ajuster vos filtres ou vos termes de recherche pour trouver ce que vous cherchez.
                </p>
                <button 
                  onClick={clearFilters}
                  className="bg-orange-400 hover:bg-orange-500 text-white font-bold px-8 py-3 rounded-full transition-all"
                >
                  Voir tous les produits
                </button>
              </div>
            )}

            {/* Pagination placeholder */}
            {total > 20 && !loading && (
              <div className="mt-12 flex justify-center gap-2">
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-400 cursor-not-allowed">Précédent</button>
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-orange-600 ring-1 ring-orange-400">1</button>
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">2</button>
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Suivant</button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;

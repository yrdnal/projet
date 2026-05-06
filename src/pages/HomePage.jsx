import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import ProductCard from '../components/common/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useTranslation } from '../utils/i18n_simple';
import {
  ArrowRightIcon,
  TruckIcon,
  ShieldCheckIcon,
  TagIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DevicePhoneMobileIcon,
  UserGroupIcon,
  HomeModernIcon,
  BeakerIcon,
  HeartIcon,
  MusicalNoteIcon,
  PuzzlePieceIcon,
  AcademicCapIcon,
  ShoppingBagIcon,
  BoltIcon,
  SparklesIcon,
  CpuChipIcon,
  ScissorsIcon,
  GlobeAltIcon,
  RocketLaunchIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon, FireIcon, GiftIcon, SparklesIcon as SparklesIconSolid } from '@heroicons/react/24/solid';

const HERO_SLIDES = [
  {
    gradient: 'from-[#232f3e] via-[#37475A] to-[#131921]',
    badge: (t) => <span className="flex items-center gap-1.5"><FireIcon className="w-3.5 h-3.5" /> Offre Limitée</span>,
    title: 'La Place de Marché #1 à Madagascar',
    subtitle: 'Achetez auprès de milliers de vendeurs locaux. Livraison rapide, paiement sécurisé, prix imbattables.',
    cta: 'Voir toutes les offres',
    ctaLink: '/products',
    sub: 'S\'inscrire gratuitement',
    subLink: '/register',
    accent: 'orange',
  },
  {
    gradient: 'from-[#0f3460] via-[#16213e] to-[#0f0e17]',
    badge: (t) => <span className="flex items-center gap-1.5"><BoltIcon className="w-4 h-4" /> Vente Flash</span>,
    title: 'Électronique & High-Tech',
    subtitle: 'Jusqu\'à 60% de réduction sur l\'électronique. Offre limitée pour nos clients privilégiés.',
    cta: 'Explorer l\'électronique',
    ctaLink: '/products?category=electronique',
    sub: 'Voir toutes les offres',
    subLink: '/products',
    accent: 'blue',
  },
  {
    gradient: 'from-[#1a0533] via-[#2d1b69] to-[#11002f]',
    badge: (t) => <span className="flex items-center gap-1.5"><SparklesIcon className="w-4 h-4 text-yellow-400" /> Nouveautés</span>,
    title: 'Mode & Vêtements',
    subtitle: 'Découvrez les dernières tendances des designers malgaches et des marques internationales.',
    cta: 'Acheter maintenant',
    ctaLink: '/products?category=vetements',
    sub: 'Devenir vendeur',
    subLink: '/register',
    accent: 'purple',
  },
];

const CATEGORY_ICONS = {
  default: { icon: <ShoppingBagIcon className="w-8 h-8" />, color: 'orange' },
  electronique: { icon: <CpuChipIcon className="w-8 h-8" />, color: 'blue' },
  vetements: { icon: <ScissorsIcon className="w-8 h-8" />, color: 'purple' },
  'maison-jardin': { icon: <HomeModernIcon className="w-8 h-8" />, color: 'green' },
  'sports-loisirs': { icon: <PuzzlePieceIcon className="w-8 h-8" />, color: 'red' },
  alimentation: { icon: <BeakerIcon className="w-8 h-8" />, color: 'yellow' },
  beaute: { icon: <SparklesIcon className="w-8 h-8" />, color: 'pink' },
  jouets: { icon: <PuzzlePieceIcon className="w-8 h-8" />, color: 'indigo' },
};

const HomePage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { products, categories, loading } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 12, sortBy: 'created_at', sortOrder: 'desc' }));
    dispatch(fetchCategories());
  }, [dispatch]);

  // Auto-slide every 5s
  useEffect(() => {
    const timer = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const handleAddToCart = async (product) => {
    await dispatch(addToCart({ productId: product.id, quantity: 1 }));
  };

  const current = HERO_SLIDES[slide];

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      {/* Hero Section */}
      <section className={`relative bg-gradient-to-br ${current.gradient} text-white overflow-hidden`} style={{ minHeight: 480 }}>
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-orange-400 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-blue-500 blur-3xl" />
        </div>

        <div className="relative max-w-screen-2xl mx-auto px-6 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fadeIn">
              <div className="inline-block bg-orange-400 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest shadow-lg shadow-orange-500/20">
                {typeof current.badge === 'function' ? current.badge(t) : current.badge}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
                {current.title}
              </h1>
              <p className="text-lg text-gray-300 mb-8 max-w-lg leading-relaxed">
                {current.subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to={current.ctaLink}
                  className="group inline-flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white font-bold px-8 py-3.5 rounded-full shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105"
                >
                  {current.cta}
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                {!isAuthenticated && (
                  <Link
                    to={current.subLink}
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold px-6 py-3.5 rounded-full backdrop-blur transition-all duration-300"
                  >
                    {current.sub}
                  </Link>
                )}
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-6 mt-10 text-sm text-gray-400">
                <span className="flex items-center gap-1.5"><CheckBadgeIcon className="w-5 h-5 text-green-400" /> Paiements sécurisés</span>
                <span className="flex items-center gap-1.5"><TruckIcon className="w-5 h-5 text-blue-400" /> Livraison rapide</span>
                <span className="flex items-center gap-1.5"><ShieldCheckIcon className="w-5 h-5 text-orange-400" /> Protection acheteur</span>
              </div>
            </div>

            {/* Slide stats card */}
            <div className="hidden md:grid grid-cols-2 gap-4">
              {[
                { icon: <FireIcon className="w-8 h-8 text-orange-400" />, val: '10K+', label: 'Produits' },
                { icon: <CheckBadgeIcon className="w-8 h-8 text-green-400" />, val: '500+', label: 'Vendeurs' },
                { icon: <StarIcon className="w-8 h-8 text-yellow-400" />, val: '4.8', label: 'Évaluation Moyenne' },
                { icon: <GiftIcon className="w-8 h-8 text-purple-400" />, val: '50K+', label: 'Acheteurs Heureux' },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-6 text-center hover:bg-white/15 transition-colors">
                  <div className="flex justify-center mb-2">{s.icon}</div>
                  <p className="text-3xl font-extrabold text-white">{s.val}</p>
                  <p className="text-sm text-gray-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Slide controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${i === slide ? 'bg-orange-400 w-6' : 'bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>
        <button
          onClick={() => setSlide((s) => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full transition-colors hidden md:flex"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <button
          onClick={() => setSlide((s) => (s + 1) % HERO_SLIDES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full transition-colors hidden md:flex"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </section>

      {/* Feature banner */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
            {[
              { icon: <TruckIcon className="w-6 h-6 text-orange-500" />, title: 'Livraison Gratuite', sub: 'Dès 100 000 Ar d\'achat' },
              { icon: <ShieldCheckIcon className="w-6 h-6 text-green-500" />, title: 'Protection Acheteur', sub: 'Remboursement à 100%' },
              { icon: <TagIcon className="w-6 h-6 text-blue-500" />, title: 'Meilleurs Prix', sub: 'Qualité garantie' },
              { icon: <StarIcon className="w-6 h-6 text-yellow-500" />, title: 'Produits de Qualité', sub: 'Vendeurs certifiés' },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-3 px-6 py-4">
                <div className="flex-shrink-0">{f.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                  <p className="text-xs text-gray-500">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {(categories || []).length > 0 && (
        <section className="py-10 bg-[#EAEDED]">
          <div className="max-w-screen-2xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900">Acheter par catégorie</h2>
              <Link to="/products" className="text-sm text-blue-600 hover:text-orange-500 font-medium transition-colors">
                Voir toutes les catégories →
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {(categories || []).slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="group flex flex-col items-center bg-white rounded-2xl p-6 text-center hover:shadow-xl hover:-translate-y-1 border border-transparent transition-all duration-300"
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                    (CATEGORY_ICONS[category.slug] || CATEGORY_ICONS.default).color === 'blue' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' :
                    (CATEGORY_ICONS[category.slug] || CATEGORY_ICONS.default).color === 'purple' ? 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white' :
                    (CATEGORY_ICONS[category.slug] || CATEGORY_ICONS.default).color === 'green' ? 'bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white' :
                    (CATEGORY_ICONS[category.slug] || CATEGORY_ICONS.default).color === 'red' ? 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white' :
                    (CATEGORY_ICONS[category.slug] || CATEGORY_ICONS.default).color === 'yellow' ? 'bg-yellow-50 text-yellow-600 group-hover:bg-yellow-600 group-hover:text-white' :
                    (CATEGORY_ICONS[category.slug] || CATEGORY_ICONS.default).color === 'pink' ? 'bg-pink-50 text-pink-600 group-hover:bg-pink-600 group-hover:text-white' :
                    (CATEGORY_ICONS[category.slug] || CATEGORY_ICONS.default).color === 'indigo' ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' :
                    'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white'
                  }`}>
                    {(CATEGORY_ICONS[category.slug] || CATEGORY_ICONS.default).icon}
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                    {category.name}
                  </h3>
                  {category.productCount > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">{category.productCount} articles</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Flash Deals Banner */}
      <section className="py-4">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-4">
              <FireIcon className="w-12 h-12 text-white flex-shrink-0" />
              <div className="flex-1">
                <p className="text-orange-100 text-sm font-medium">Temps limité</p>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
                  Offres du jour <FireIcon className="w-6 h-6 animate-pulse" />
                </h3>
                <p className="text-orange-100 text-sm">Nouvelles offres chaque jour — jusqu'à -70% !</p>
              </div>
            </div>
            <Link
              to="/products?sort=discount"
              className="flex-shrink-0 bg-white text-orange-600 font-bold px-8 py-3 rounded-full hover:bg-orange-50 transition-colors shadow"
            >
              Acheter maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-10 bg-[#EAEDED]">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">Produits Vedettes</h2>
              <p className="text-sm text-gray-500 mt-0.5">Sélectionnés par notre équipe juste pour vous</p>
            </div>
            <Link to="/products" className="text-sm text-blue-600 hover:text-orange-500 font-medium transition-colors">
              Voir tous les produits →
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner size="lg" className="py-12" />
          ) : (products || []).length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {(products || []).slice(0, 12).map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBagIcon className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">Aucun produit disponible pour le moment.</p>
              <p className="text-sm text-gray-400 mt-1">Revenez bientôt ou devenez vendeur !</p>
              <Link to="/register" className="mt-6 inline-block bg-orange-400 hover:bg-orange-500 text-white font-semibold px-6 py-2.5 rounded-full transition-colors">
                Commencer à vendre
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Sell on MalagasyShop CTA */}
      <section className="py-16 bg-[#131921] text-white">
        <div className="max-w-screen-xl mx-auto px-6 text-center">
          <CheckBadgeIcon className="w-16 h-16 text-orange-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Commencez à vendre sur MalagasyShop</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Rejoignez notre communauté croissante de plus de 500 vendeurs. Atteignez des clients dans tout Madagascar sans frais initiaux.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white font-bold px-10 py-4 rounded-full shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
            >
              Devenir Vendeur — C'est Gratuit
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link to="/products" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-full border border-white/20 transition-all">
              Explorer le Marché
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto">
            {[
              { val: '0', label: 'Frais d\'inscription', suffix: 'Ar' },
              { val: '24/7', label: 'Support' },
              { val: '100K+', label: 'Clients' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold text-orange-400">{s.val} {s.suffix || ''}</p>
                <p className="text-sm text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

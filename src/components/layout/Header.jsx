import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { logout } from '../../store/slices/authSlice';
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  MapPinIcon,
  ChevronDownIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../utils/i18n_simple';
import { fetchCategories } from '../../store/slices/productSlice';

const categories_limit = 6;

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);
  const { categories } = useSelector((state) => state.products);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  const toggleLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLangMenuOpen(false);
  };

  const handleLogout = async () => {
    await dispatch(logout());
    setUserMenuOpen(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() || searchCategory) {
      let url = '/products?';
      if (searchQuery.trim()) url += `search=${encodeURIComponent(searchQuery)}&`;
      if (searchCategory) url += `category=${searchCategory}`;
      navigate(url);
      setSearchQuery('');
    }
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'vendor': return '/vendor';
      case 'admin': return '/admin';
      case 'superadmin': return '/superadmin';
      default: return '/profile';
    }
  };

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Top bar - dark navy */}
      <div className="bg-[#131921] text-white">
        <div className={`max-w-screen-2xl mx-auto px-4 flex items-center h-14 ${isAuthenticated ? 'gap-1 md:gap-4' : 'gap-4'}`}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 border border-transparent hover:border-white rounded px-1.5 py-1 transition-colors flex-shrink-0">
            <div className="w-8 h-8 bg-orange-400 rounded flex items-center justify-center">
              <span className="text-white font-extrabold text-lg leading-none">M</span>
            </div>
            <span className={`text-white font-bold text-base hidden ${isAuthenticated ? 'lg:block' : 'sm:block'}`}>MalagasyShop</span>
            <span className={`text-orange-400 text-xs font-semibold hidden ${isAuthenticated ? 'lg:block' : 'sm:block'}`}>.mg</span>
          </Link>

          {/* Deliver to */}
          <div className={`${isAuthenticated ? 'hidden xl:flex' : 'hidden lg:flex'} flex-col border border-transparent hover:border-white rounded px-2 py-1 cursor-pointer transition-colors`}>
            <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">{t('nav.deliver_to')}</span>
            <span className="text-white text-xs font-black flex items-center gap-0.5">
              <MapPinIcon className="w-3.5 h-3.5" /> Madagascar
            </span>
          </div>

          {/* Language Switcher */}
          <div className="relative">
            <button 
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              onBlur={() => setTimeout(() => setLangMenuOpen(false), 150)}
              className="hidden md:flex items-center gap-1 border border-transparent hover:border-white rounded px-2 py-1 cursor-pointer transition-colors"
            >
              <GlobeAltIcon className="w-4 h-4 text-gray-400" />
              <span className="text-white text-xs font-bold uppercase">{i18n.language}</span>
              <ChevronDownIcon className="w-3 h-3 text-gray-400" />
            </button>
            {langMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded shadow-2xl z-50 border border-gray-200 py-2 text-gray-800">
                <button onClick={() => toggleLanguage('fr')} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${i18n.language === 'fr' ? 'text-orange-600 font-bold' : 'text-gray-700'}`}>
                   Français (FR)
                </button>
                <button onClick={() => toggleLanguage('mg')} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${i18n.language === 'mg' ? 'text-orange-600 font-bold' : 'text-gray-700'}`}>
                   Malagasy (MG)
                </button>
              </div>
            )}
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className={`flex-1 flex min-w-0 ${isAuthenticated ? 'max-w-[150px] sm:max-w-[250px] md:max-w-md lg:max-w-xl' : 'max-w-3xl'}`}>
            <select 
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className={`bg-gray-200 text-gray-700 text-xs px-2 rounded-l-md border-r border-gray-300 cursor-pointer focus:outline-none hidden ${isAuthenticated ? 'lg:block' : 'md:block'}`}
            >
              <option value="">{t('nav.all')}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('nav.search_placeholder')}
              className={`flex-1 px-4 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${isAuthenticated ? 'rounded-l-md lg:rounded-l-none' : 'rounded-l-md md:rounded-l-none'}`}
            />
            <button
              type="submit"
              className="bg-orange-400 hover:bg-orange-500 px-4 rounded-r-md transition-colors"
            >
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-900" />
            </button>
          </form>

          {/* Account */}
          <div className="relative hidden md:block flex-shrink-0">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
              className="border border-transparent hover:border-white rounded px-2 py-1 transition-colors text-left max-w-[150px]"
            >
              <p className="text-gray-300 text-[10px] uppercase font-bold tracking-tight truncate">
                {isAuthenticated ? `${t('nav.hello')}, ${user?.firstName || 'User'}` : t('nav.sign_in')}
              </p>
              <p className="text-white text-xs font-black flex items-center gap-0.5">
                {t('nav.my_account')} <ChevronDownIcon className="w-3 h-3" />
              </p>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded shadow-2xl z-50 border border-gray-200 text-gray-800">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-3 border-b">
                      <p className="font-semibold text-sm">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                    <Link to={getDashboardLink()} className="block px-4 py-2.5 text-sm hover:bg-gray-50 hover:text-orange-600" onClick={() => setUserMenuOpen(false)}>
                      {user?.role === 'client' ? t('nav.my_account') : 'Dashboard'}
                    </Link>
                    <Link to="/orders" className="block px-4 py-2.5 text-sm hover:bg-gray-50 hover:text-orange-600" onClick={() => setUserMenuOpen(false)}>
                      {t('nav.returns_orders')}
                    </Link>
                    <Link to="/profile" className="block px-4 py-2.5 text-sm hover:bg-gray-50 hover:text-orange-600" onClick={() => setUserMenuOpen(false)}>
                      {t('nav.profile_settings')}
                    </Link>
                    <hr className="my-1" />
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                      {t('nav.sign_out')}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="p-4">
                      <Link to="/login" className="block w-full text-center py-2 bg-orange-400 hover:bg-orange-500 text-white font-semibold rounded text-sm transition-colors" onClick={() => setUserMenuOpen(false)}>
                        {t('nav.sign_in')}
                      </Link>
                    </div>
                    <p className="text-xs text-center text-gray-500 pb-2">
                      {t('nav.new_customer')}{' '}
                      <Link to="/register" className="text-blue-600 hover:text-orange-600" onClick={() => setUserMenuOpen(false)}>
                        {t('nav.start_here')}
                      </Link>
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Returns & Orders */}
          {isAuthenticated && (
            <Link to="/orders" className="hidden lg:flex flex-col border border-transparent hover:border-white rounded px-2 py-1 transition-colors flex-shrink-0">
              <span className="text-gray-300 text-[10px] uppercase font-bold tracking-tight">{t('nav.returns')}</span>
              <span className="text-white text-xs font-black">&amp; {t('nav.orders')}</span>
            </Link>
          )}

          {/* Sell on MalagasyShop */}
          {!isAuthenticated && (
            <Link to="/register" className="hidden lg:flex flex-col border border-transparent hover:border-white rounded px-2 py-1 transition-colors">
              <span className="text-gray-300 text-xs">{t('nav.hello')}</span>
              <span className="text-white text-xs font-bold">{t('nav.sell')}</span>
            </Link>
          )}



          {/* Cart */}
          <Link to="/cart" className="relative flex items-end gap-1 border border-transparent hover:border-white rounded px-2 py-1 transition-colors flex-shrink-0">
            <div className="relative">
              <ShoppingCartIcon className="w-8 h-8 text-white" />
              {totalItems > 0 && (
                <span className="absolute -top-1 left-4 bg-orange-400 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-[#131921] px-0.5">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </div>
            <span className="text-white text-xs font-black hidden lg:block mb-0.5">{t('nav.cart_text')}</span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1 text-white hover:text-orange-400 transition-colors flex-shrink-0"
          >
            {mobileMenuOpen ? <XMarkIcon className="w-7 h-7" /> : <Bars3Icon className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Category nav bar */}
      <div className="bg-[#232f3e] text-white">
        <div className="max-w-screen-2xl mx-auto px-4">
          <nav className="flex items-center h-10 overflow-x-auto gap-1 scrollbar-hide">
            <button 
              onClick={() => navigate('/products')}
              className="flex items-center gap-1.5 px-3 py-1 text-sm font-semibold hover:bg-white/10 rounded whitespace-nowrap transition-colors flex-shrink-0"
            >
              <Bars3Icon className="w-4 h-4" /> {t('nav.all')}
            </button>
            <Link
              to="/products"
              className="px-3 py-1 text-sm whitespace-nowrap hover:bg-white/10 rounded transition-colors flex-shrink-0"
            >
              Autre
            </Link>
            {categories.slice(0, categories_limit).map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="px-3 py-1 text-sm whitespace-nowrap hover:bg-white/10 rounded transition-colors flex-shrink-0"
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-xl border-t">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="p-4 border-b">
            <div className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('nav.search_placeholder')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button type="submit" className="bg-orange-400 px-4 rounded-r hover:bg-orange-500">
                <MagnifyingGlassIcon className="w-5 h-5 text-white" />
              </button>
            </div>
          </form>

          <div className="p-4 space-y-1">
            {isAuthenticated ? (
              <>
                <p className="text-sm font-semibold text-gray-700 px-3 py-2">{t('nav.hello')}, {user?.firstName}</p>
                <Link to={getDashboardLink()} className="block px-3 py-2.5 text-sm rounded hover:bg-gray-100 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>

                <Link to="/orders" className="block px-3 py-2.5 text-sm rounded hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>{t('nav.orders')}</Link>
                <Link to="/profile" className="block px-3 py-2.5 text-sm rounded hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>{t('nav.profile')}</Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2.5 text-sm text-red-600 rounded hover:bg-red-50">{t('nav.sign_out')}</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2.5 text-sm font-semibold text-center bg-orange-400 text-white rounded hover:bg-orange-500" onClick={() => setMobileMenuOpen(false)}>{t('nav.sign_in')}</Link>
                <Link to="/register" className="block px-3 py-2.5 text-sm text-center border border-gray-300 rounded hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>{t('nav.register')}</Link>
              </>
            )}
          </div>
          <div className="border-t p-4 space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase px-3 mb-2">{t('nav.browse_categories')}</p>
            {categories.map((cat) => (
              <Link key={cat.id} to={`/products?category=${cat.id}`} className="block px-3 py-2 text-sm rounded hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

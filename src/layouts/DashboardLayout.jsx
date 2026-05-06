import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { logout } from '../store/slices/authSlice';
import {
  HomeIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UsersIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
  Squares2X2Icon,
  ChartBarIcon,
  ShieldCheckIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from '../utils/i18n_simple';

const DashboardLayout = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };

  const getNavItems = () => {
    const base = `/${user?.role}`;
    switch (user?.role) {
      case 'vendor':
        return [
          { name: t('nav.dashboard'), href: base, icon: ChartBarIcon },
          { name: t('nav.my_products'), href: `${base}/products`, icon: ShoppingBagIcon },
          { name: t('nav.orders'), href: `${base}/orders`, icon: ShoppingCartIcon },
        ];
      case 'admin':
        return [
          { name: t('nav.dashboard'), href: base, icon: ChartBarIcon },
          { name: t('nav.users'), href: `${base}/users`, icon: UsersIcon },
          { name: t('nav.products'), href: `${base}/products`, icon: ShoppingBagIcon },
          { name: t('nav.orders'), href: `${base}/orders`, icon: ShoppingCartIcon },
          { name: t('nav.categories'), href: `${base}/categories`, icon: Squares2X2Icon },
        ];
      case 'superadmin':
        return [
          { name: t('nav.dashboard'), href: base, icon: ChartBarIcon },
          { name: t('nav.all_users'), href: `${base}/users`, icon: UsersIcon },
          { name: t('nav.settings'), href: `${base}/settings`, icon: CogIcon },
          // Can also access admin sections
          { name: `— ${t('nav.admin_tools')}`, href: null, icon: null, isDivider: true },
          { name: `${t('nav.products')} (Admin)`, href: '/admin/products', icon: ShoppingBagIcon },
          { name: `${t('nav.categories')} (Admin)`, href: '/admin/categories', icon: Squares2X2Icon },
          { name: `${t('nav.orders')} (Admin)`, href: '/admin/orders', icon: ShoppingCartIcon },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const roleColors = {
    vendor: 'from-purple-600 to-violet-700',
    admin: 'from-orange-500 to-amber-600',
    superadmin: 'from-red-600 to-rose-700',
  };
  const roleGrad = roleColors[user?.role] || 'from-gray-700 to-gray-800';

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-[#1a1f2e]">
      {/* Header */}
      <div className={`bg-gradient-to-br ${roleGrad} px-4 py-5`}>
        <Link to="/" className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-white/20 rounded flex items-center justify-center">
            <span className="text-white font-extrabold text-sm">M</span>
          </div>
          <span className="text-white font-bold text-base">MalagasyShop</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold flex-shrink-0">
            {(user?.firstName?.[0] || '?').toUpperCase()}{(user?.lastName?.[0] || '').toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">{user?.firstName} {user?.lastName}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {user?.role === 'superadmin' && <ShieldCheckIcon className="w-3 h-3 text-yellow-300" />}
              <span className="text-white/70 text-xs capitalize">{user?.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navItems.map((item, idx) => {
          if (item.isDivider) {
            return (
              <div key={idx} className="px-3 py-2 mt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{item.name}</p>
              </div>
            );
          }
          const isActive = location.pathname === item.href ||
            (item.href !== `/${user?.role}` && location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-all group ${
                isActive
                  ? 'bg-orange-400 text-white shadow-md shadow-orange-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`} style={{ width: '1.125rem', height: '1.125rem' }} />
              <span className="flex-1">{item.name}</span>
              {isActive && <ChevronRightIcon className="w-3.5 h-3.5 opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/5 space-y-1">
        <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
          <HomeIcon className="w-4.5 h-4.5" style={{ width: '1.125rem', height: '1.125rem' }} />
          {t('nav.back_to_store')}
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
          <ArrowLeftOnRectangleIcon className="w-4.5 h-4.5" style={{ width: '1.125rem', height: '1.125rem' }} />
          {t('nav.logout')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-col fixed inset-y-0 left-0 z-40">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-60 flex-col flex z-50">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Bars3Icon className="w-5 h-5" />
            </button>
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500">
              <span className="capitalize font-semibold text-gray-900">{user?.role} Panel</span>
              <span className="mx-2 text-gray-300">/</span>
              <span className="capitalize">{location.pathname.split('/').filter(Boolean).slice(1).join(' / ') || t('nav.dashboard')}</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 px-4 md:px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

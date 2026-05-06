import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  ShoppingBagIcon,
  LockClosedIcon,
  CreditCardIcon,
  MapPinIcon,
  UserCircleIcon,
  QuestionMarkCircleIcon,
  GiftIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from '../utils/i18n_simple';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);

  const ACCOUNT_CARDS = [
    {
      title: t('profile.your_orders'),
      desc: t('profile.orders_desc'),
      icon: <ShoppingBagIcon className="w-10 h-10 text-orange-400" />,
      link: '/orders',
    },
    {
      title: t('profile.security'),
      desc: t('profile.security_desc'),
      icon: <LockClosedIcon className="w-10 h-10 text-orange-400" />,
      link: '#',
    },
    {
      title: t('profile.payments'),
      desc: t('profile.payments_desc'),
      icon: <CreditCardIcon className="w-10 h-10 text-orange-400" />,
      link: '#',
    },
    {
      title: t('profile.addresses'),
      desc: t('profile.addresses_desc'),
      icon: <MapPinIcon className="w-10 h-10 text-orange-400" />,
      link: '#',
    },
    {
      title: t('profile.messages'),
      desc: t('profile.messages_desc'),
      icon: <EnvelopeIcon className="w-10 h-10 text-orange-400" />,
      link: '#',
    },
  ];

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">{t('profile.account')}</h1>

        {/* User Info Quick View */}
        <div className="bg-[#EAEDED] rounded-2xl p-6 mb-12 flex items-center gap-6 border border-gray-200">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-4 border-orange-400 shadow-sm overflow-hidden">
            <span className="text-3xl font-black text-gray-400 uppercase">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h2>
            <p className="text-gray-500 font-medium">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                {user?.role} Account
              </span>
              <span className="text-xs text-gray-400">Membre depuis Oct 2024</span>
            </div>
          </div>
          <div className="ml-auto hidden md:block">
            <Link 
              to="/orders"
              className="text-sm font-bold text-blue-600 hover:text-orange-600 transition-colors flex items-center gap-1"
            >
              {t('order.view_details')} <QuestionMarkCircleIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ACCOUNT_CARDS.map((card) => (
            <Link
              key={card.title}
              to={card.link}
              className="group flex gap-4 p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                {card.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{card.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5 leading-tight">{card.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recommendations Section */}
        <div className="mt-20 pt-12 border-t border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">{t('profile.recommendations')}</h2>
          <div className="bg-orange-50 rounded-2xl p-8 flex flex-col items-center text-center">
            <GiftIcon className="w-12 h-12 text-orange-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('profile.exclusive_deals')}</h3>
            <p className="text-gray-600 mb-6 max-w-md">
              {t('profile.deals_desc')}
            </p>
            <Link 
              to="/products"
              className="px-8 py-3 bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-bold rounded-full shadow-sm transition-all"
            >
              {t('profile.view_recommendations')}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;

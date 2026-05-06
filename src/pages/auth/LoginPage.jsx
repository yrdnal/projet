import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../store/slices/authSlice';
import { mergeCart } from '../../store/slices/cartSlice';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../../utils/i18n_simple';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const from = location.state?.from?.pathname;
      if (from && from !== '/') { navigate(from, { replace: true }); return; }
      const roleHome = { superadmin: '/superadmin', admin: '/admin', vendor: '/vendor' };
      navigate(roleHome[user.role] || '/', { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  useEffect(() => () => { dispatch(clearError()); }, [dispatch]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(login(formData)).unwrap();
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) dispatch(mergeCart(sessionId));
    } catch { /* handled by Redux */ }
  };

  return (
    <div className="min-h-screen bg-[#EAEDED] flex flex-col items-center justify-center py-12 px-4">
      {/* Top accent bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-red-400 to-purple-500" />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-[#131921] rounded-lg flex items-center justify-center">
              <span className="text-orange-400 font-extrabold text-xl">M</span>
            </div>
            <span className="text-[#131921] font-extrabold text-2xl">MalagasyShop</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('nav.login')}</h1>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm animate-slideUp">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t('auth.email')}
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="vous@exemple.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  {t('auth.password')}
                </label>
                <a href="#" className="text-xs text-blue-600 hover:text-orange-500 transition-colors font-medium">
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-orange-400 focus:ring-orange-400" />
              <span className="text-sm text-gray-600">Rester connecté</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-400 hover:bg-orange-500 text-white font-bold rounded-lg transition-all hover:shadow-md active:scale-[0.99] disabled:opacity-60 text-sm mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('auth.sign_in_btn')}...
                </span>
              ) : t('auth.sign_in_btn')}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">{t('nav.new_customer')}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <Link
            to="/register"
            className="block w-full text-center py-3 border border-gray-300 hover:border-orange-400 text-gray-700 hover:text-orange-600 font-semibold rounded-lg transition-all text-sm hover:bg-orange-50"
          >
            {t('nav.register')}
          </Link>
        </div>

        

        {/* Footer links */}
        <div className="flex justify-center gap-4 mt-6 text-xs text-gray-500">
          {['Conditions', 'Confidentialité', 'Aide'].map((l) => (
            <a key={l} href="#" className="hover:text-orange-500 hover:underline transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

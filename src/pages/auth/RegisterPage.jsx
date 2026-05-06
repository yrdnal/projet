import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../../store/slices/authSlice';
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../utils/i18n_simple';

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client',
    // Client fields
    phone: '',
    emailContact: '',
    // Vendor fields
    shopName: '',
    contactEmail: '',
    phoneNumbers: [''],
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle dynamic phone numbers for vendor
  const handlePhoneNumberChange = (index, value) => {
    const newPhones = [...formData.phoneNumbers];
    newPhones[index] = value;
    setFormData({ ...formData, phoneNumbers: newPhones });
  };

  const addPhoneNumber = () => {
    if (formData.phoneNumbers.length < 5) {
      setFormData({ ...formData, phoneNumbers: [...formData.phoneNumbers, ''] });
    }
  };

  const removePhoneNumber = (index) => {
    if (formData.phoneNumbers.length > 1) {
      const newPhones = formData.phoneNumbers.filter((_, i) => i !== index);
      setFormData({ ...formData, phoneNumbers: newPhones });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return alert('Les mots de passe ne correspondent pas');
    }
    if (formData.password.length < 6) {
      return alert('Le mot de passe doit contenir au moins 6 caractères');
    }

    // Prepare data
    const submitData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      phone: formData.phone,
      emailContact: formData.emailContact || formData.email,
    };

    if (formData.role === 'vendor') {
      submitData.shopName = formData.shopName;
      submitData.contactEmail = formData.contactEmail || formData.email;
      submitData.phoneNumbers = formData.phoneNumbers.filter((p) => p.trim() !== '');
    }

    dispatch(register(submitData));
  };

  return (
    <div className="min-h-screen bg-[#EAEDED] flex flex-col items-center justify-center py-12 px-4 relative">
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-red-400 to-purple-500" />

      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-[#131921] rounded-lg flex items-center justify-center">
              <span className="text-orange-400 font-extrabold text-xl">M</span>
            </div>
            <span className="text-[#131921] font-extrabold text-2xl">MalagasyShop</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('nav.register')}</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Prénom & Nom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prénom</label>
                <input
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom</label>
                <input
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('auth.email')}</label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="vous@exemple.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('auth.password')}</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Au moins 6 caractères"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirmer mot de passe */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmer le mot de passe</label>
              <input
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Choix du rôle */}
            <div className="pt-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Je souhaite m'inscrire en tant que :</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'client' })}
                  className={`py-3 rounded-lg text-sm font-semibold border transition-all flex flex-col items-center gap-1 ${
                    formData.role === 'client'
                      ? 'border-orange-400 bg-orange-50 text-orange-600 ring-1 ring-orange-400'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <UserIcon className="w-5 h-5" />
                  Acheteur
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'vendor' })}
                  className={`py-3 rounded-lg text-sm font-semibold border transition-all flex flex-col items-center gap-1 ${
                    formData.role === 'vendor'
                      ? 'border-orange-400 bg-orange-50 text-orange-600 ring-1 ring-orange-400'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <BuildingStorefrontIcon className="w-5 h-5" />
                  Vendeur
                </button>
              </div>
            </div>

            {/* ──────── CHAMPS CLIENT ──────── */}
            {formData.role === 'client' && (
              <div className="space-y-4 pt-2 border-t border-gray-100 mt-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider pt-2">Informations de contact</p>

                {/* Téléphone client */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Numéro de téléphone</label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+261 34 00 000 00"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                </div>

                {/* Email de contact client */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email de contact</label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      name="emailContact"
                      type="email"
                      value={formData.emailContact}
                      onChange={handleChange}
                      placeholder="Email de contact (par défaut identique à votre email)"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Sera utilisé pour les notifications de commande.</p>
                </div>
              </div>
            )}

            {/* ──────── CHAMPS VENDEUR ──────── */}
            {formData.role === 'vendor' && (
              <div className="space-y-4 pt-2 border-t border-gray-100 mt-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider pt-2">Informations de la boutique</p>

                {/* Nom de la boutique */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom de la boutique *</label>
                  <div className="relative">
                    <BuildingStorefrontIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      name="shopName"
                      type="text"
                      required
                      value={formData.shopName}
                      onChange={handleChange}
                      placeholder="Ex: Boutique Malagasy Élégance"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                </div>

                {/* Numéros de téléphone (dynamique) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Numéro(s) de téléphone *
                  </label>
                  <div className="space-y-2">
                    {formData.phoneNumbers.map((phone, index) => (
                      <div key={index} className="flex gap-2">
                        <div className="relative flex-1">
                          <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => handlePhoneNumberChange(index, e.target.value)}
                            placeholder={`Numéro ${index + 1} — ex: +261 34 00 000 00`}
                            required={index === 0}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                          />
                        </div>
                        {formData.phoneNumbers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePhoneNumber(index)}
                            className="flex-shrink-0 w-10 h-10 mt-0.5 flex items-center justify-center rounded-lg border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Supprimer ce numéro"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {formData.phoneNumbers.length < 5 && (
                    <button
                      type="button"
                      onClick={addPhoneNumber}
                      className="mt-2 inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-semibold"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      Ajouter un autre numéro
                    </button>
                  )}
                </div>

                {/* Email de contact boutique */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email de contact boutique *</label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      name="contactEmail"
                      type="email"
                      required
                      value={formData.contactEmail}
                      onChange={handleChange}
                      placeholder="contact@maboutique.mg"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Cet email sera visible par vos clients pour vous contacter.</p>
                </div>

                {/* Téléphone personnel vendeur */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Téléphone personnel</label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+261 34 00 000 00"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 italic leading-tight">
                  * Les comptes vendeurs peuvent nécessiter une approbation manuelle par un administrateur.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-400 hover:bg-orange-500 text-white font-bold rounded-lg transition-all hover:shadow-md disabled:opacity-60 text-sm mt-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Inscription en cours...
                </span>
              ) : (
                t('nav.register')
              )}
            </button>
          </form>

          <p className="text-xs text-gray-600 mt-6 leading-relaxed">
            En créant un compte, vous acceptez les{' '}
            <a href="#" className="text-blue-600 hover:text-orange-500 hover:underline">
              Conditions d'utilisation
            </a>{' '}
            et la{' '}
            <a href="#" className="text-blue-600 hover:text-orange-500 hover:underline">
              Politique de confidentialité
            </a>{' '}
            de MalagasyShop.
          </p>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="text-sm text-gray-700 text-center">
            Vous avez déjà un compte ?{' '}
            <Link to="/login" className="text-blue-600 hover:text-orange-500 font-semibold">
              Se connecter →
            </Link>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-8 text-xs text-gray-500">
          {['Conditions', 'Confidentialité', 'Aide'].map((l) => (
            <a key={l} href="#" className="hover:text-orange-500 hover:underline transition-colors">
              {l}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

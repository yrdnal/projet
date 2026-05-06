import { Link } from 'react-router-dom';
import {
  MapPinIcon, PhoneIcon, EnvelopeIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const FOOTER_LINKS = {
  'À propos de nous': [
    { label: 'À propos de MalagasyShop', href: '/products' },
    { label: 'Carrières', href: '/products' },
    { label: 'Communiqués de presse', href: '/products' },
    { label: 'MalagasyShop s\'engage', href: '/products' },
    { label: 'Offrir un sourire', href: '/products' },
  ],
  'Vendre avec nous': [
    { label: 'Vendre sur MalagasyShop', href: '/register' },
    { label: 'Devenir affilié', href: '#' },
    { label: 'Annoncez vos produits', href: '#' },
    { label: 'MalagasyShop Pay', href: '#' },
  ],
  'Moyens de paiement': [
    { label: 'Mobile Money', href: '/cart' },
    { label: 'Virement bancaire', href: '/cart' },
    { label: 'Paiement à la livraison', href: '/cart' },
    { label: 'Acheter avec des points', href: '/cart' },
  ],
  'Aide et Assistance': [
    { label: 'Votre compte', href: '/profile' },
    { label: 'Vos commandes', href: '/orders' },
    { label: 'Tarifs de livraison', href: '/cart' },
    { label: 'Retours et remplacements', href: '/orders' },
    { label: 'Centre d\'aide', href: '/profile' },
  ],
};

const Footer = () => {
  return (
    <footer>
      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-full bg-[#37475A] hover:bg-[#485769] text-white text-sm font-medium py-3.5 text-center transition-colors"
      >
        Retour en haut
      </button>

      {/* Main footer */}
      <div className="bg-[#232f3e] text-gray-300">
        <div className="max-w-screen-2xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-white font-bold text-sm mb-4">{title}</h3>
                <ul className="space-y-2.5">
                  {links.map((l) => (
                    <li key={l.label}>
                      <Link to={l.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 mt-10 pt-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-400 rounded flex items-center justify-center">
                  <span className="text-white font-extrabold text-base">M</span>
                </div>
                <span className="text-white font-extrabold text-lg">MalagasyShop</span>
                <span className="text-orange-400 text-sm font-semibold">.mg</span>
              </Link>

              {/* Contact info */}
              <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <MapPinIcon className="w-3.5 h-3.5 text-orange-400" />
                  Antananarivo, Madagascar
                </span>
                <span className="flex items-center gap-1.5">
                  <PhoneIcon className="w-3.5 h-3.5 text-orange-400" />
                  +261 37 80 030 14
                </span>
                <span className="flex items-center gap-1.5">
                  <EnvelopeIcon className="w-3.5 h-3.5 text-orange-400" />
                  razafiarisonlandry7@gmail.com
                </span>
              </div>

              {/* Language / Region */}
              <button className="flex items-center gap-1 border border-gray-600 hover:border-gray-400 text-sm text-gray-300 px-3 py-1.5 rounded transition-colors">
                🌍 FR &nbsp;<ChevronRightIcon className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[#131921] text-gray-500 text-xs">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} MalagasyShop, Inc. ou ses filiales. Tous droits réservés.</p>
          <div className="flex flex-wrap items-center gap-4 justify-center">
            {['Confidentialité', 'Conditions d\'utilisation', 'Publicités basées sur vos centres d\'intérêt'].map((l) => (
              <a key={l} href="#" className="hover:text-gray-300 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

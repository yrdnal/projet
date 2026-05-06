import { Link, useNavigate } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className="min-h-screen bg-[#EAEDED] flex flex-col items-center justify-center px-4 py-16">
      {/* Visual */}
      <div className="text-center max-w-lg">
        <div className="relative inline-block mb-8">
          <div className="text-[120px] font-extrabold text-gray-200 leading-none select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-orange-400 text-white rounded-2xl px-5 py-2 shadow-lg -rotate-3">
              <p className="text-lg font-bold">Oops!</p>
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
          Page not found
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          We looked everywhere but couldn't find what you're looking for.
          The page may have been moved, deleted, or never existed.
        </p>

        {/* Search */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-3">Try searching for something</p>
          <form onSubmit={handleSearch} className="flex">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <button type="submit" className="bg-orange-400 hover:bg-orange-500 text-white px-5 rounded-r-lg font-semibold transition-colors">
              Go
            </button>
          </form>
        </div>

        {/* Popular links */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {[
            { label: 'Home', path: '/' },
            { label: 'All Products', path: '/products' },
            { label: 'My Cart', path: '/cart' },
            { label: 'My Orders', path: '/orders' },
            { label: 'My Profile', path: '/profile' },
          ].map((l) => (
            <Link key={l.path} to={l.path}
              className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:border-orange-400 hover:text-orange-600 transition-colors shadow-sm">
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" /> Go Back
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 px-8 py-3 bg-orange-400 hover:bg-orange-500 text-white rounded-full text-sm font-bold transition-all hover:shadow-lg"
          >
            <HomeIcon className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-red-400 to-purple-500" />
    </div>
  );
};

export default NotFoundPage;

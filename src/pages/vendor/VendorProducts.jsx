import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendorProducts, deleteProduct } from '../../store/slices/productSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  ChevronRightIcon,
  ArchiveBoxIcon,
  ExclamationCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { getImageUrl } from '../../utils/url';

const VendorProducts = () => {
  const dispatch = useDispatch();
  const { vendorProducts, loading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchVendorProducts());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
      try {
        await dispatch(deleteProduct(id)).unwrap();
      } catch (error) {
        alert(error || 'Échec de la suppression du produit');
      }
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen bg-gray-50 flex items-center justify-center p-8 rounded-3xl" />;

  return (
    <div className="max-w-screen-2xl mx-auto pb-12">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-[#0A0F1C] rounded-[2.5rem] p-8 md:p-12 mb-10 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-8 border border-white/5">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-gradient-to-tl from-orange-500/10 to-transparent rounded-full blur-[60px] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white/80 text-xs font-bold uppercase tracking-widest mb-4 border border-white/10">
             <ArchiveBoxIcon className="w-4 h-4 text-indigo-400" /> Mon Catalogue
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Gestion des <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Produits</span></h1>
          <p className="text-sm text-gray-400 mt-3 font-medium">Gérez votre catalogue, vos prix et surveillez vos niveaux de stock en temps réel.</p>
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher SKU ou nom..." 
              className="pl-11 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none w-full sm:w-64 md:w-72 shadow-inner backdrop-blur-sm transition-all"
            />
          </div>
          <Link 
            to="/vendor/products/add" 
            className="group flex justify-center items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold px-6 py-3.5 rounded-2xl shadow-[0_0_40px_-10px_rgba(249,115,22,0.5)] hover:shadow-[0_0_60px_-15px_rgba(249,115,22,0.6)] transition-all duration-300 hover:-translate-y-1 text-sm border border-orange-400/50"
          >
            <div className="bg-white/20 p-1.5 rounded-full group-hover:rotate-90 transition-transform duration-300">
              <PlusIcon className="w-4 h-4" />
            </div>
            Ajouter un produit
          </Link>
        </div>
      </div>

      {vendorProducts.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-dashed border-gray-200 p-16 md:p-24 text-center shadow-sm">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <ArchiveBoxIcon className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">Votre inventaire est vide</h3>
          <p className="text-sm font-medium text-gray-500 mb-8 max-w-sm mx-auto">
            Prêt à commencer à vendre ? Ajoutez votre premier article et touchez dès aujourd'hui des clients dans tout Madagascar.
          </p>
          <Link 
            to="/vendor/products/add" 
            className="inline-flex items-center gap-3 bg-gray-900 hover:bg-gray-800 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-all"
          >
            <PlusIcon className="w-5 h-5" /> Publier mon premier article
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm shadow-gray-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/80 backdrop-blur-md border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Détails du Produit</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Prix</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Stock</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Statut</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vendorProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 shadow-sm">
                          <img
                            src={getImageUrl(product.images?.[0])}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => { 
                              e.target.onerror = null; 
                              e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22150%22%20height%3D%22150%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23f3f4f6%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20fill%3D%22%239ca3af%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E'; 
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate max-w-[200px] sm:max-w-xs">{product.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-1 tracking-tighter uppercase bg-gray-100/50 inline-block px-1.5 py-0.5 rounded">SKU: {product.sku || product.id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-gray-900">{parseFloat(product.price).toLocaleString()} MGA</p>
                      {product.discountPrice && <p className="text-[10px] text-orange-600 font-bold line-through mt-0.5">{parseFloat(product.discountPrice).toLocaleString()} MGA</p>}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${product.stockQuantity === 0 ? 'text-rose-600' : product.stockQuantity < 5 ? 'text-orange-500' : 'text-gray-900'}`}>
                          {product.stockQuantity} unités
                        </span>
                        {product.stockQuantity < 5 && (
                          <span className="text-[10px] flex items-center gap-1 text-orange-500 font-bold mt-1 bg-orange-50 px-1.5 py-0.5 rounded w-fit">
                            <ExclamationCircleIcon className="w-3 h-3" /> Faible
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        product.isApproved 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-orange-50 text-orange-700 border border-orange-100'
                      }`}>
                        {product.isApproved ? (
                          <><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Actif</>
                        ) : (
                          <><div className="w-1.5 h-1.5 bg-orange-500 rounded-full" /> En attente</>
                        )}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/vendor/products/edit/${product.id}`}
                          className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          title="Modifier le produit"
                        >
                          <PencilIcon className="w-4 h-4 text-current" strokeWidth={2.5} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Supprimer le produit"
                        >
                          <TrashIcon className="w-4 h-4 text-current" strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProducts;

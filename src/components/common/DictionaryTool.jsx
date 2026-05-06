import { useState } from 'react';
import { useTranslation } from '../../utils/i18n_simple';
import { BookOpenIcon, ArrowsRightLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';

const DICTIONARY = {
  // Products
  "produit": "vokatra",
  "prix": "vidiny",
  "quantité": "isa",
  "stock": "tahiry",
  "vendre": "mivarotra",
  "acheter": "mividy",
  "panier": "sakaosy",
  "livraison": "fanaterana",
  "vêtement": "fitafiana",
  "chaussures": "kiraro",
  "ordinateur": "solosaina",
  "téléphone": "telefaonina",
  "alimentation": "sakafo",
  "artisanat": "taozavatra",
  "maison": "trano",
  "marché": "tsena",
  "gratuit": "maimaimpoana",
  "cher": "lafo",
  "bon marché": "mora",
  "nouveau": "vaovao",
  "ancien": "tranainy",
  "bienvenue": "tonga soa",
  "merci": "misaotra",
  "s'il vous plaît": "azafady",
  "oui": "eny",
  "non": "tsia",
  "rouge": "mena",
  "bleu": "manga",
  "vert": "maitso",
  "jaune": "mavo",
  "noir": "mainty",
  "blanc": "fotsy",
};

const DictionaryTool = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [result, setResult] = useState('');

  const handleTranslate = (e) => {
    const term = e.target.value.toLowerCase().trim();
    setSearch(term);
    
    // Reverse lookup if searching Malagasy
    const malagasyEntries = Object.entries(DICTIONARY).find(([fr, mg]) => mg === term);
    if (malagasyEntries) {
      setResult(malagasyEntries[0]);
    } else {
      setResult(DICTIONARY[term] || '');
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-orange-500 text-white p-4 rounded-full shadow-2xl hover:bg-orange-600 transition-all z-40 group"
      >
        <BookOpenIcon className="w-6 h-6" />
        <span className="absolute right-full mr-4 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Dictionnaire FR/MG
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-slideUp">
      <div className="bg-[#131921] p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <BookOpenIcon className="w-5 h-5 text-orange-400" />
          <h3 className="font-bold text-sm">Dictionnaire FR ↔ MG</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:text-orange-400 transition-colors">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-6">
        <div className="relative mb-6">
          <input 
            type="text"
            value={search}
            onChange={handleTranslate}
            placeholder="Entrez un mot..."
            className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 outline-none"
          />
          <ArrowsRightLeftIcon className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" />
        </div>

        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 min-h-[100px] flex flex-col items-center justify-center text-center">
          {result ? (
            <>
              <p className="text-xs text-orange-600 uppercase font-bold tracking-widest mb-1">Traduction</p>
              <p className="text-xl font-black text-gray-900 capitalize">{result}</p>
            </>
          ) : (
            <p className="text-sm text-gray-400 italic">
              {search ? "Mot non trouvé dans le lexique." : "Prêt à traduire vos termes commerciaux..."}
            </p>
          )}
        </div>

        <div className="mt-6 text-[10px] text-gray-400 bg-gray-50 p-2 rounded italic">
          Tip: Utilisez cet outil pour traduire vos noms de produits ou descriptions entre le Malagasy et le Français.
        </div>
      </div>
    </div>
  );
};

export default DictionaryTool;

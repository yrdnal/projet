import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  fr: {
    translation: {
      "nav": {
        "home": "Accueil",
        "products": "Produits",
        "cart": "Panier",
        "orders": "Commandes",
        "login": "Connexion",
        "register": "S'inscrire",
        "logout": "Déconnexion",
        "profile": "Profil"
      },
      "hero": {
        "title": "Le meilleur de Madagascar à portée de main",
        "subtitle": "Livraison rapide dans toutes les régions",
        "shop_now": "Acheter maintenant"
      },
      "common": {
        "search": "Rechercher...",
        "add_to_cart": "Ajouter au panier",
        "out_of_stock": "Rupture de stock",
        "low_stock": "Stock faible",
        "free_shipping": "Livraison GRATUITE",
        "view_details": "Voir détails",
        "price": "Prix",
        "total": "Total",
        "quantity": "Quantité",
        "status": "Statut"
      },
      "categories": {
        "electronics": "Électronique",
        "clothing": "Vêtements",
        "home": "Maison & Jardin",
        "food": "Alimentation",
        "handicraft": "Artisanat"
      }
    }
  },
  mg: {
    translation: {
      "nav": {
        "home": "Fandraisana",
        "products": "Vokatra",
        "cart": "Sakaosy",
        "orders": "Kaomandy",
        "login": "Hiditra",
        "register": "Hisoratra anarana",
        "logout": "Hivoaka",
        "profile": "Tantontany"
      },
      "hero": {
        "title": "Ny tsara indrindra eto Madagasikara",
        "subtitle": "Fanaterana haingana manerana ny nosy",
        "shop_now": "Hividy izao"
      },
      "common": {
        "search": "Hitady...",
        "add_to_cart": "Hampiditra anaty harona",
        "out_of_stock": "Lany stock",
        "low_stock": "Kely sisa",
        "free_shipping": "Fanaterana MAIMAIMPOANA",
        "view_details": "Hijery antsipiriany",
        "price": "Vidiny",
        "total": "Fitambarany",
        "quantity": "Isany",
        "status": "Toe-javatra"
      },
      "categories": {
        "electronics": "Elektronika",
        "clothing": "Fitafiana",
        "home": "Trano sy Zaridaina",
        "food": "Sakafo",
        "handicraft": "Taozavatra"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr', // Default language
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

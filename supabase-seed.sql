-- ============================================================
-- MalagasyShop — Données de test (Seed)
-- À exécuter dans l'éditeur SQL de Supabase APRÈS le schéma
-- ============================================================

-- Fonction utilitaire pour créer un utilisateur de test
CREATE OR REPLACE FUNCTION create_seed_user(
  p_email TEXT,
  p_password TEXT,
  p_meta JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  -- Insérer dans auth.users
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    p_meta,
    NOW(),
    NOW()
  ) RETURNING id INTO new_id;

  -- Créer l'identité associée (nécessaire pour la connexion)
  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    new_id,
    p_email,
    jsonb_build_object('sub', new_id::TEXT, 'email', p_email),
    'email',
    NOW(),
    NOW(),
    NOW()
  );

  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- CRÉATION DES UTILISATEURS DE TEST
-- Tous les emails arrivent à : land.rfh@gmail.com
-- Mot de passe universel : Password123!
-- ============================================================

-- ---- 2 SUPER ADMINS ----
SELECT create_seed_user(
  'land.rfh+superadmin1@gmail.com',
  'Password123!',
  '{"first_name":"Super","last_name":"Admin1","role":"superadmin","phone":"+261340000001","email_contact":"land.rfh@gmail.com"}'
);

SELECT create_seed_user(
  'land.rfh+superadmin2@gmail.com',
  'Password123!',
  '{"first_name":"Super","last_name":"Admin2","role":"superadmin","phone":"+261340000002","email_contact":"land.rfh@gmail.com"}'
);

-- ---- 2 ADMINS ----
SELECT create_seed_user(
  'land.rfh+admin1@gmail.com',
  'Password123!',
  '{"first_name":"Admin","last_name":"Manager1","role":"admin","phone":"+261340000003","email_contact":"land.rfh@gmail.com"}'
);

SELECT create_seed_user(
  'land.rfh+admin2@gmail.com',
  'Password123!',
  '{"first_name":"Admin","last_name":"Manager2","role":"admin","phone":"+261340000004","email_contact":"land.rfh@gmail.com"}'
);

-- ---- 2 CLIENTS ----
SELECT create_seed_user(
  'land.rfh+client1@gmail.com',
  'Password123!',
  '{"first_name":"Client","last_name":"Acheteur1","role":"client","phone":"+261340000005","email_contact":"land.rfh@gmail.com"}'
);

SELECT create_seed_user(
  'land.rfh+client2@gmail.com',
  'Password123!',
  '{"first_name":"Client","last_name":"Acheteur2","role":"client","phone":"+261340000006","email_contact":"land.rfh@gmail.com"}'
);

-- ---- 2 VENDEURS ----
SELECT create_seed_user(
  'land.rfh+vendor1@gmail.com',
  'Password123!',
  '{"first_name":"Vendeur","last_name":"Marchand1","role":"vendor","phone":"+261340000007","email_contact":"land.rfh@gmail.com","shop_name":"Boutique Marchand1","phone_numbers":["+261341111111","+261341111112"],"contact_email":"land.rfh+vendor1@gmail.com"}'
);

SELECT create_seed_user(
  'land.rfh+vendor2@gmail.com',
  'Password123!',
  '{"first_name":"Vendeur","last_name":"Marchand2","role":"vendor","phone":"+261340000008","email_contact":"land.rfh@gmail.com","shop_name":"Boutique Marchand2","phone_numbers":["+261342222221","+261342222222"],"contact_email":"land.rfh+vendor2@gmail.com"}'
);

-- ============================================================
-- PRODUITS DE DÉMONSTRATION
-- ============================================================

-- Récupérer les IDs des vendeurs et catégories
DO $$
DECLARE
  v_vendor1_id UUID;
  v_vendor2_id UUID;
  v_cat_elec UUID;
  v_cat_vet UUID;
  v_cat_maison UUID;
  v_cat_artisanat UUID;
  v_cat_beaute UUID;
  v_cat_alim UUID;
BEGIN
  -- Récupérer les IDs vendeurs
  SELECT id INTO v_vendor1_id FROM public.profiles WHERE email = 'land.rfh+vendor1@gmail.com';
  SELECT id INTO v_vendor2_id FROM public.profiles WHERE email = 'land.rfh+vendor2@gmail.com';

  -- Récupérer les IDs catégories
  SELECT id INTO v_cat_elec FROM public.categories WHERE slug = 'electronique';
  SELECT id INTO v_cat_vet FROM public.categories WHERE slug = 'vetements';
  SELECT id INTO v_cat_maison FROM public.categories WHERE slug = 'maison-jardin';
  SELECT id INTO v_cat_artisanat FROM public.categories WHERE slug = 'artisanat';
  SELECT id INTO v_cat_beaute FROM public.categories WHERE slug = 'beaute';
  SELECT id INTO v_cat_alim FROM public.categories WHERE slug = 'alimentation';

  -- Produits du Vendeur 1
  INSERT INTO public.products (name, description, price, compare_price, category_id, vendor_id, stock, status, images) VALUES
  ('Smartphone Android 128Go', 'Smartphone haute performance avec écran 6.5 pouces, 128 Go de stockage et double caméra 48MP.', 450000, 550000, v_cat_elec, v_vendor1_id, 25, 'active', '{}'),
  ('Écouteurs Bluetooth Sans Fil', 'Écouteurs sans fil avec réduction de bruit active, autonomie 24h et boîtier de charge.', 85000, 120000, v_cat_elec, v_vendor1_id, 50, 'active', '{}'),
  ('T-Shirt Coton Bio Madagascar', 'T-shirt 100% coton biologique avec motifs traditionnels malgaches.', 35000, 45000, v_cat_vet, v_vendor1_id, 100, 'active', '{}'),
  ('Lambahoany Traditionnel', 'Lambahoany authentique fait main avec motifs floraux traditionnels.', 25000, NULL, v_cat_vet, v_vendor1_id, 75, 'active', '{}'),
  ('Vanille de Madagascar - 100g', 'Vanille bourbon de première qualité, récoltée à la main dans le nord-est de Madagascar.', 180000, 220000, v_cat_alim, v_vendor1_id, 30, 'active', '{}'),
  ('Huile Essentielle Ylang-Ylang', 'Huile essentielle pure 100% naturelle de Nosy Be.', 45000, 55000, v_cat_beaute, v_vendor1_id, 40, 'active', '{}');

  -- Produits du Vendeur 2
  INSERT INTO public.products (name, description, price, compare_price, category_id, vendor_id, stock, status, images) VALUES
  ('Sculpture en Palissandre', 'Sculpture décorative artisanale en bois de palissandre, réalisée par des artisans malgaches.', 150000, 200000, v_cat_artisanat, v_vendor2_id, 10, 'active', '{}'),
  ('Panier en Raphia Coloré', 'Panier tressé en raphia naturel avec motifs colorés, idéal pour la décoration.', 65000, 80000, v_cat_artisanat, v_vendor2_id, 35, 'active', '{}'),
  ('Nappe Brodée Main', 'Nappe brodée main avec motifs floraux, dimensions 150x200cm.', 95000, NULL, v_cat_maison, v_vendor2_id, 20, 'active', '{}'),
  ('Laptop Stand en Bois', 'Support pour ordinateur portable en bois sculpté, design ergonomique.', 75000, 95000, v_cat_elec, v_vendor2_id, 15, 'active', '{}'),
  ('Miel Sauvage de Forêt - 500ml', 'Miel sauvage récolté dans les forêts de l''est de Madagascar.', 55000, 70000, v_cat_alim, v_vendor2_id, 45, 'active', '{}'),
  ('Savon Artisanal aux Épices', 'Savon fait main avec des épices naturelles de Madagascar.', 15000, 20000, v_cat_beaute, v_vendor2_id, 80, 'active', '{}');
END $$;

-- ============================================================
-- NETTOYAGE : Supprimer la fonction utilitaire
-- ============================================================
DROP FUNCTION IF EXISTS create_seed_user;

-- ============================================================
-- FIN DES DONNÉES DE TEST
-- ============================================================

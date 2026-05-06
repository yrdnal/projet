-- ============================================================
-- MalagasyShop — Schéma complet Supabase
-- À exécuter dans l'éditeur SQL de Supabase (Dashboard > SQL Editor)
-- ============================================================

-- 0. Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. TABLES
-- ============================================================

-- 1.1 Profils utilisateurs (étend auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  email_contact TEXT,
  role TEXT NOT NULL DEFAULT 'client'
    CHECK (role IN ('client', 'vendor', 'admin', 'superadmin')),
  is_active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 Profils vendeurs (boutique)
CREATE TABLE IF NOT EXISTS public.vendor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  shop_name TEXT NOT NULL DEFAULT '',
  phone_numbers TEXT[] NOT NULL DEFAULT '{}',
  contact_email TEXT NOT NULL DEFAULT '',
  description TEXT,
  logo_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 Catégories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 Produits
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  compare_price DECIMAL(12,2),
  images TEXT[] DEFAULT '{}',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sku TEXT,
  stock INT DEFAULT 0,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'pending')),
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5 Paniers
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.6 Articles du panier
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cart_id, product_id)
);

-- 1.7 Commandes
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  order_number TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  shipping_cost DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  shipping_address JSONB,
  payment_method TEXT DEFAULT 'cod',
  payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.8 Articles de commande
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  vendor_id UUID NOT NULL REFERENCES public.profiles(id),
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.9 Avis
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- 1.10 Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  receiver_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.11 Paramètres du système (superadmin)
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. INDEX pour la performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_products_vendor ON public.products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_vendor ON public.order_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_carts_user ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_session ON public.carts(session_id);

-- ============================================================
-- 3. FONCTIONS & TRIGGERS
-- ============================================================

-- 3.1 Mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER trg_products_updated
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER trg_orders_updated
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER trg_vendor_profiles_updated
  BEFORE UPDATE ON public.vendor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER trg_carts_updated
  BEFORE UPDATE ON public.carts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 3.2 Création automatique du profil après inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role, phone, email_contact)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE(NEW.raw_user_meta_data->>'email_contact', NULL)
  );

  -- Si c'est un vendeur, créer aussi son profil boutique
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'client') = 'vendor' THEN
    INSERT INTO public.vendor_profiles (user_id, shop_name, phone_numbers, contact_email)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'shop_name', 'Ma Boutique'),
      CASE
        WHEN NEW.raw_user_meta_data->'phone_numbers' IS NOT NULL
        THEN ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'phone_numbers'))
        ELSE '{}'::TEXT[]
      END,
      COALESCE(NEW.raw_user_meta_data->>'contact_email', NEW.email)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3.3 Générer un numéro de commande unique
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number = 'MS-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Fonctions helper SECURITY DEFINER pour éviter la boucle infinie (500 Server Error)
CREATE OR REPLACE FUNCTION public.get_user_role() RETURNS TEXT AS $$
DECLARE r TEXT;
BEGIN
  SELECT role INTO r FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(r, 'client');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_user_role() IN ('admin', 'superadmin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- ---- PROFILES ----
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (public.is_admin());

-- ---- VENDOR PROFILES ----
CREATE POLICY "vendor_profiles_select_all" ON public.vendor_profiles FOR SELECT USING (true);
CREATE POLICY "vendor_profiles_update_own" ON public.vendor_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "vendor_profiles_insert_own" ON public.vendor_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "vendor_profiles_admin_all" ON public.vendor_profiles FOR ALL USING (public.is_admin());

-- ---- CATEGORIES ----
CREATE POLICY "categories_select_all" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_manage" ON public.categories FOR ALL USING (public.is_admin());

-- ---- PRODUCTS ----
CREATE POLICY "products_select_active" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_vendor_insert" ON public.products FOR INSERT WITH CHECK (auth.uid() = vendor_id);
CREATE POLICY "products_vendor_update" ON public.products FOR UPDATE USING (auth.uid() = vendor_id);
CREATE POLICY "products_vendor_delete" ON public.products FOR DELETE USING (auth.uid() = vendor_id);
CREATE POLICY "products_admin_all" ON public.products FOR ALL USING (public.is_admin());

-- ---- CARTS ----
CREATE POLICY "carts_own" ON public.carts FOR ALL USING (auth.uid() = user_id OR (user_id IS NULL AND session_id IS NOT NULL));
CREATE POLICY "carts_anon_select" ON public.carts FOR SELECT USING (user_id IS NULL AND session_id IS NOT NULL);
CREATE POLICY "carts_anon_insert" ON public.carts FOR INSERT WITH CHECK (true);

-- ---- CART ITEMS ----
CREATE POLICY "cart_items_own" ON public.cart_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id
    AND (carts.user_id = auth.uid() OR (carts.user_id IS NULL AND carts.session_id IS NOT NULL))
  )
);
CREATE POLICY "cart_items_insert" ON public.cart_items FOR INSERT WITH CHECK (true);

-- ---- ORDERS ----
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_admin_all" ON public.orders FOR ALL USING (public.is_admin());
CREATE POLICY "orders_vendor_select" ON public.orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.order_items WHERE order_items.order_id = orders.id AND order_items.vendor_id = auth.uid())
);

-- ---- ORDER ITEMS ----
CREATE POLICY "order_items_select_own" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()) OR vendor_id = auth.uid()
);
CREATE POLICY "order_items_insert" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "order_items_vendor_update" ON public.order_items FOR UPDATE USING (vendor_id = auth.uid());
CREATE POLICY "order_items_admin_all" ON public.order_items FOR ALL USING (public.is_admin());

-- ---- REVIEWS ----
CREATE POLICY "reviews_select_all" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update_own" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reviews_delete_own" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- ---- MESSAGES ----
CREATE POLICY "messages_own" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "messages_insert" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "messages_update_read" ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);

-- ---- SYSTEM SETTINGS ----
CREATE POLICY "system_settings_select" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "system_settings_admin" ON public.system_settings FOR ALL USING (public.get_user_role() = 'superadmin');

-- ============================================================
-- 5. STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('shop-logos', 'shop-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Policies de stockage
DROP POLICY IF EXISTS "product_images_select" ON storage.objects;
CREATE POLICY "product_images_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product_images_insert" ON storage.objects;
CREATE POLICY "product_images_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images'
    AND auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "product_images_delete" ON storage.objects;
CREATE POLICY "product_images_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images'
    AND auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "avatars_select" ON storage.objects;
CREATE POLICY "avatars_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_insert" ON storage.objects;
CREATE POLICY "avatars_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "shop_logos_select" ON storage.objects;
CREATE POLICY "shop_logos_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'shop-logos');

DROP POLICY IF EXISTS "shop_logos_insert" ON storage.objects;
CREATE POLICY "shop_logos_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'shop-logos' AND auth.uid() IS NOT NULL);

-- ============================================================
-- 6. CATÉGORIES PAR DÉFAUT
-- ============================================================
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
  ('Électronique', 'electronique', 'Téléphones, ordinateurs, accessoires et tout appareil électronique', 1),
  ('Vêtements', 'vetements', 'Mode homme, femme et enfant', 2),
  ('Maison & Jardin', 'maison-jardin', 'Meubles, décoration, cuisine et jardinage', 3),
  ('Sports & Loisirs', 'sports-loisirs', 'Équipements sportifs et loisirs', 4),
  ('Alimentation', 'alimentation', 'Produits alimentaires et boissons', 5),
  ('Beauté & Santé', 'beaute', 'Cosmétiques, soins et bien-être', 6),
  ('Jouets & Enfants', 'jouets', 'Jouets, jeux et articles pour enfants', 7),
  ('Artisanat Malgache', 'artisanat', 'Produits artisanaux faits main de Madagascar', 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 7. PARAMÈTRES SYSTÈME PAR DÉFAUT
-- ============================================================
INSERT INTO public.system_settings (key, value) VALUES
  ('site_name', '"MalagasyShop"'),
  ('site_description', '"La Place de Marché #1 à Madagascar"'),
  ('currency', '"MGA"'),
  ('shipping_fee_default', '5000'),
  ('free_shipping_threshold', '100000'),
  ('vendor_commission_percent', '10'),
  ('maintenance_mode', 'false')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- FIN DU SCHÉMA
-- ============================================================

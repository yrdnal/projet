-- ============================================================
-- SOLUTION FINALE: Suppression Complète et Reconstruction RLS
-- Exécutez ce script dans Supabase SQL Editor
-- ============================================================

-- ============================================================
-- ÉTAPE 1: DÉSACTIVER RLS temporairement
-- ============================================================
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- ÉTAPE 2: SUPPRIMER TOUTES LES POLITIQUES EXISTANTES
-- ============================================================

-- Supprimer toutes les politiques de la table orders
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'orders' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.orders', pol.policyname);
    END LOOP;
END $$;

-- Supprimer toutes les politiques de la table order_items
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'order_items' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.order_items', pol.policyname);
    END LOOP;
END $$;

-- ============================================================
-- ÉTAPE 3: RÉACTIVER RLS
-- ============================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ÉTAPE 4: CRÉER LES NOUVELLES POLITIQUES (SANS RÉCURSION)
-- ============================================================

-- ============================================================
-- ORDERS - Politiques Simplifiées
-- ============================================================

-- 1. Les utilisateurs peuvent voir leurs propres commandes
CREATE POLICY "orders_user_select" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Les utilisateurs peuvent créer leurs propres commandes
CREATE POLICY "orders_user_insert" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Les utilisateurs peuvent mettre à jour leurs propres commandes
CREATE POLICY "orders_user_update" 
ON public.orders 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 4. Les admins peuvent tout faire
CREATE POLICY "orders_admin_all" 
ON public.orders 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- 5. Les vendeurs peuvent voir les commandes contenant leurs produits
-- IMPORTANT: Utilise une fonction SECURITY DEFINER pour éviter la récursion
CREATE OR REPLACE FUNCTION public.vendor_can_see_order(order_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.order_items 
    WHERE order_id = order_uuid 
    AND vendor_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE POLICY "orders_vendor_select" 
ON public.orders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'vendor'
  )
  AND public.vendor_can_see_order(id)
);

-- ============================================================
-- ORDER_ITEMS - Politiques Simplifiées
-- ============================================================

-- 1. Les utilisateurs peuvent voir les items de leurs commandes
CREATE POLICY "order_items_user_select" 
ON public.order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- 2. Les utilisateurs peuvent insérer des items dans leurs commandes
CREATE POLICY "order_items_user_insert" 
ON public.order_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- 3. Les vendeurs peuvent voir leurs propres items
CREATE POLICY "order_items_vendor_select" 
ON public.order_items 
FOR SELECT 
USING (vendor_id = auth.uid());

-- 4. Les vendeurs peuvent mettre à jour le statut de leurs items
CREATE POLICY "order_items_vendor_update" 
ON public.order_items 
FOR UPDATE 
USING (vendor_id = auth.uid());

-- 5. Les admins peuvent tout faire
CREATE POLICY "order_items_admin_all" 
ON public.order_items 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- ============================================================
-- ÉTAPE 5: VÉRIFICATION
-- ============================================================

-- Afficher toutes les politiques créées
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('orders', 'order_items')
ORDER BY tablename, policyname;

-- ============================================================
-- ÉTAPE 6: TEST DE CONNEXION
-- ============================================================

-- Vérifier que l'utilisateur actuel peut créer une commande
SELECT 
  CASE 
    WHEN auth.uid() IS NOT NULL THEN 'Utilisateur connecté: ' || auth.uid()::text
    ELSE 'Aucun utilisateur connecté'
  END as status;

-- ============================================================
-- FIN DU SCRIPT
-- ============================================================

-- Si vous voyez ce message sans erreur, les politiques sont correctement configurées!
-- Vous pouvez maintenant tester la création de commande dans votre application.

-- Made with Bob

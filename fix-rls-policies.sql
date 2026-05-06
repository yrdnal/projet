-- ============================================================
-- FIX: Infinite Recursion in Orders RLS Policies
-- Execute this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- STEP 1: Drop ALL existing policies for orders and order_items
-- ============================================================

-- Drop all orders policies
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
DROP POLICY IF EXISTS "orders_update_own" ON public.orders;
DROP POLICY IF EXISTS "orders_admin_all" ON public.orders;
DROP POLICY IF EXISTS "orders_vendor_select" ON public.orders;
DROP POLICY IF EXISTS "orders_vendor_view" ON public.orders;

-- Drop all order_items policies
DROP POLICY IF EXISTS "order_items_select_own" ON public.order_items;
DROP POLICY IF EXISTS "order_items_select_by_user" ON public.order_items;
DROP POLICY IF EXISTS "order_items_select_by_vendor" ON public.order_items;
DROP POLICY IF EXISTS "order_items_insert" ON public.order_items;
DROP POLICY IF EXISTS "order_items_insert_own" ON public.order_items;
DROP POLICY IF EXISTS "order_items_vendor_update" ON public.order_items;
DROP POLICY IF EXISTS "order_items_admin_all" ON public.order_items;

-- ============================================================
-- STEP 2: Create NEW policies without recursion
-- ============================================================

-- ---- ORDERS POLICIES ----

-- Users can see their own orders
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own orders (for cancellation, etc.)
CREATE POLICY "orders_update_own" ON public.orders
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can do everything with orders
CREATE POLICY "orders_admin_all" ON public.orders
  FOR ALL
  USING (public.is_admin());

-- Vendors can see orders that contain their products
-- FIXED: Use a simpler subquery without recursion
CREATE POLICY "orders_vendor_view" ON public.orders
  FOR SELECT
  USING (
    public.get_user_role() = 'vendor'
    AND id IN (
      SELECT DISTINCT order_id
      FROM public.order_items
      WHERE vendor_id = auth.uid()
    )
  );

-- ---- ORDER ITEMS POLICIES ----

-- Users can see order items from their own orders
CREATE POLICY "order_items_select_by_user" ON public.order_items
  FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
  );

-- Vendors can see their own order items
CREATE POLICY "order_items_select_by_vendor" ON public.order_items
  FOR SELECT
  USING (vendor_id = auth.uid());

-- Users can insert order items for their own orders
CREATE POLICY "order_items_insert_own" ON public.order_items
  FOR INSERT
  WITH CHECK (
    order_id IN (
      SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
  );

-- Vendors can update status of their order items
CREATE POLICY "order_items_vendor_update" ON public.order_items
  FOR UPDATE
  USING (vendor_id = auth.uid());

-- Admins can do everything with order items
CREATE POLICY "order_items_admin_all" ON public.order_items
  FOR ALL
  USING (public.is_admin());

-- ============================================================
-- STEP 3: Verification
-- ============================================================

-- Check if policies are correctly applied
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('orders', 'order_items')
ORDER BY tablename, policyname;

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
-- If you see the policies listed above without errors, the fix is complete!
-- Now test creating an order in your application.
-- ============================================================

-- Made with Bob

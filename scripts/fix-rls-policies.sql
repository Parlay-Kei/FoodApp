-- Add missing RLS policy for profile insertion
CREATE POLICY profiles_insert_own ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Add policy for service role to bypass RLS
CREATE POLICY supabase_service_admin ON profiles
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Add policy for service role to bypass RLS on menu_items
CREATE POLICY supabase_service_admin ON menu_items
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Add policy for service role to bypass RLS on orders
CREATE POLICY supabase_service_admin ON orders
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Add policy for service role to bypass RLS on order_items
CREATE POLICY supabase_service_admin ON order_items
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

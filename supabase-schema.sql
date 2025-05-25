-- Create tables for the Food Truck App

-- Profiles table (extends Supabase Auth users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  receive_sms BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu items table
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  is_vegan BOOLEAN DEFAULT FALSE,
  is_vegetarian BOOLEAN DEFAULT FALSE,
  is_spicy BOOLEAN DEFAULT FALSE,
  is_gluten_free BOOLEAN DEFAULT FALSE,
  available_today BOOLEAN DEFAULT FALSE,
  quantity_available INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'ready', 'completed', 'cancelled')),
  total DECIMAL(10, 2) NOT NULL,
  pickup_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id UUID REFERENCES menu_items(id) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to decrement menu item quantity
CREATE OR REPLACE FUNCTION decrement_item_quantity(item_id UUID, quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE menu_items
  SET quantity_available = GREATEST(0, quantity_available - quantity)
  WHERE id = item_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get top selling items
CREATE OR REPLACE FUNCTION get_top_selling_items(start_date TIMESTAMP WITH TIME ZONE, end_date TIMESTAMP WITH TIME ZONE, limit_count INTEGER)
RETURNS TABLE (
  id UUID,
  name TEXT,
  total_quantity BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mi.id,
    mi.name,
    SUM(oi.quantity) as total_quantity
  FROM 
    order_items oi
  JOIN 
    menu_items mi ON oi.menu_item_id = mi.id
  JOIN 
    orders o ON oi.order_id = o.id
  WHERE 
    o.created_at >= start_date AND 
    o.created_at <= end_date AND
    o.status != 'cancelled'
  GROUP BY 
    mi.id, mi.name
  ORDER BY 
    total_quantity DESC
  LIMIT 
    limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to delete a user and their data
CREATE OR REPLACE FUNCTION delete_user()
RETURNS VOID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Get the current user ID
  user_id := auth.uid();
  
  -- Delete user's orders and related data (cascade will handle order_items)
  DELETE FROM orders WHERE user_id = user_id;
  
  -- Delete user's profile
  DELETE FROM profiles WHERE id = user_id;
  
  -- Delete the user from auth.users
  -- This requires admin privileges, so we'll use a trigger or separate process
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_menu_items_timestamp
BEFORE UPDATE ON menu_items
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_orders_timestamp
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create RLS (Row Level Security) policies
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Users can read their own profile
CREATE POLICY profiles_select_own ON profiles
FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY profiles_update_own ON profiles
FOR UPDATE USING (auth.uid() = id);

-- Menu items policies
-- Anyone can read menu items
CREATE POLICY menu_items_select_all ON menu_items
FOR SELECT USING (true);

-- Only admins can insert, update, delete menu items
CREATE POLICY menu_items_insert_admin ON menu_items
FOR INSERT WITH CHECK (EXISTS (
  SELECT 1 FROM profiles
  WHERE id = auth.uid() AND is_admin = true
));

CREATE POLICY menu_items_update_admin ON menu_items
FOR UPDATE USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE id = auth.uid() AND is_admin = true
));

CREATE POLICY menu_items_delete_admin ON menu_items
FOR DELETE USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE id = auth.uid() AND is_admin = true
));

-- Orders policies
-- Users can read their own orders
CREATE POLICY orders_select_own ON orders
FOR SELECT USING (auth.uid() = user_id);

-- Admins can read all orders
CREATE POLICY orders_select_admin ON orders
FOR SELECT USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE id = auth.uid() AND is_admin = true
));

-- Users can insert their own orders
CREATE POLICY orders_insert_own ON orders
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only admins can update orders
CREATE POLICY orders_update_admin ON orders
FOR UPDATE USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE id = auth.uid() AND is_admin = true
));

-- Order items policies
-- Users can read their own order items
CREATE POLICY order_items_select_own ON order_items
FOR SELECT USING (EXISTS (
  SELECT 1 FROM orders
  WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
));

-- Admins can read all order items
CREATE POLICY order_items_select_admin ON order_items
FOR SELECT USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE id = auth.uid() AND is_admin = true
));

-- Users can insert their own order items
CREATE POLICY order_items_insert_own ON order_items
FOR INSERT WITH CHECK (EXISTS (
  SELECT 1 FROM orders
  WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
));

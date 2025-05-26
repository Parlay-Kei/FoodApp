// Script to seed the database with initial data

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './.env.local' });

// Check if force update flag is passed
const forceUpdate = process.argv.includes('--force');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Log which key we're using (without revealing the full key)
console.log(`Using key type: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service role' : 'anon'} key`);

// Initialize Supabase client with the service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseKey);

// Sample menu items data
const sampleMenuItems = [
  {
    name: "Classic Burger",
    description: "Juicy beef patty with lettuce, tomato, onion, and our special sauce on a brioche bun",
    price: 9.99,
    image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop",
    is_vegan: false,
    is_vegetarian: false,
    is_spicy: false,
    is_gluten_free: false,
    available_today: true,
    quantity_available: 20
  },
  {
    name: "Veggie Burger",
    description: "Plant-based patty with avocado, lettuce, tomato, and vegan mayo on a whole grain bun",
    price: 10.99,
    image_url: "https://images.unsplash.com/photo-1520072959219-c595dc870360?q=80&w=1000&auto=format&fit=crop",
    is_vegan: true,
    is_vegetarian: true,
    is_spicy: false,
    is_gluten_free: false,
    available_today: true,
    quantity_available: 15
  },
  {
    name: "Spicy Chicken Sandwich",
    description: "Crispy chicken breast with spicy sauce, pickles, and coleslaw on a toasted bun",
    price: 8.99,
    image_url: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=1000&auto=format&fit=crop",
    is_vegan: false,
    is_vegetarian: false,
    is_spicy: true,
    is_gluten_free: false,
    available_today: true,
    quantity_available: 18
  },
  {
    name: "Loaded Fries",
    description: "Crispy fries topped with cheese sauce, bacon bits, jalapeños, and green onions",
    price: 6.99,
    image_url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=1000&auto=format&fit=crop",
    is_vegan: false,
    is_vegetarian: false,
    is_spicy: true,
    is_gluten_free: true,
    available_today: true,
    quantity_available: 25
  },
  {
    name: "Caesar Salad",
    description: "Crisp romaine lettuce with parmesan cheese, croutons, and our homemade Caesar dressing",
    price: 7.99,
    image_url: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=1000&auto=format&fit=crop",
    is_vegan: false,
    is_vegetarian: true,
    is_spicy: false,
    is_gluten_free: false,
    available_today: true,
    quantity_available: 12
  },
  {
    name: "Baked Chicken Wings",
    description: "Crispy oven-baked chicken wings seasoned with our signature spice blend",
    price: 12.99,
    image_url: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?q=80&w=1000&auto=format&fit=crop",
    is_vegan: false,
    is_vegetarian: false,
    is_spicy: true,
    is_gluten_free: true,
    available_today: true,
    quantity_available: 15
  },
  {
    name: "Cornbread",
    description: "Homemade sweet cornbread with honey butter, freshly baked daily",
    price: 4.99,
    image_url: "https://images.unsplash.com/photo-1621510007845-3bd6dbc91c57?q=80&w=1000&auto=format&fit=crop",
    is_vegan: false,
    is_vegetarian: true,
    is_spicy: false,
    is_gluten_free: false,
    available_today: true,
    quantity_available: 20
  },
  {
    name: "Red Beans and Rice w/Sausage",
    description: "Slow-cooked red beans with smoked sausage, served over fluffy white rice with Cajun seasoning",
    price: 9.99,
    image_url: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?q=80&w=1000&auto=format&fit=crop",
    is_vegan: false,
    is_vegetarian: false,
    is_spicy: true,
    is_gluten_free: true,
    available_today: true,
    quantity_available: 18
  }
];

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    console.log(`Using Supabase URL: ${supabaseUrl.substring(0, 15)}...`);

    // Test connection to Supabase
    console.log('Testing connection to Supabase...');
    const { data: connectionTest, error: connectionError } = await supabase.from('menu_items').select('*').limit(1);
    
    if (connectionError) {
      console.error('Connection test failed:', connectionError);
      throw new Error(`Failed to connect to Supabase: ${connectionError.message}`);
    }
    
    console.log('Connection to Supabase successful!');

    // First check if menu items already exist
    console.log('Checking existing menu items...');
    const { data: existingItems, error: checkError } = await supabase
      .from('menu_items')
      .select('name')
      .limit(1);
      
    if (checkError) {
      console.error('Error checking existing items:', checkError);
      throw new Error(`Failed to check existing items: ${checkError.message}`);
    }
    
    // If items already exist and force update is not enabled, skip insertion
    if (existingItems && existingItems.length > 0 && !forceUpdate) {
      console.log('Menu items already exist in the database. Skipping insertion to avoid duplicates.');
      console.log('If you want to re-insert items, run this script with the --force flag.');
    } else {
      // If force update is enabled and items exist, delete them first
      if (existingItems && existingItems.length > 0 && forceUpdate) {
        console.log('Force update enabled. Deleting existing menu items...');
        
        // Get all menu item IDs
        const { data: allItems, error: fetchError } = await supabase
          .from('menu_items')
          .select('id');
          
        if (fetchError) {
          console.error('Error fetching items to delete:', fetchError);
          throw new Error(`Failed to fetch items for deletion: ${fetchError.message}`);
        }
        
        if (allItems && allItems.length > 0) {
          // Delete all items one by one
          for (const item of allItems) {
            const { error: deleteError } = await supabase
              .from('menu_items')
              .delete()
              .eq('id', item.id);
              
            if (deleteError) {
              console.error(`Error deleting item ${item.id}:`, deleteError);
              throw new Error(`Failed to delete item ${item.id}: ${deleteError.message}`);
            }
          }
          console.log(`Deleted ${allItems.length} existing menu items successfully.`);
        } else {
          console.log('No items found to delete.');
        }
      }
      
      // Insert sample menu items
      console.log('Inserting sample menu items...');
      try {
        const { data: menuItems, error: menuError } = await supabase
          .from('menu_items')
          .insert(sampleMenuItems)
          .select();

        if (menuError) {
          throw menuError;
        }

        console.log(`Successfully inserted ${menuItems ? menuItems.length : 0} menu items`);
      } catch (insertError) {
        console.error('Error during menu item insertion:', insertError);
        throw new Error(`Failed to insert menu items: ${insertError.message}`);
      }
    }

    // Create an admin user if needed
    // Note: This requires the user to already exist in Auth
    console.log('Checking for admin user...');
    const { data: adminUsers, error: adminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_admin', true);

    if (adminError) {
      throw adminError;
    }

    if (adminUsers.length === 0) {
      console.log('No admin users found. Please create an admin user manually in the Supabase dashboard.');
      console.log('After creating a user, update their profile with is_admin=true');
    } else {
      console.log(`Found ${adminUsers.length} admin users`);
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seeding function
seedDatabase();

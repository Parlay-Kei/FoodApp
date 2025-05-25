// Sample menu items data for the Food Truck App
// This can be used to populate the database with initial data

export const sampleMenuItems = [
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
    name: "Fish Tacos",
    description: "Grilled fish with cabbage slaw, pico de gallo, and lime crema on corn tortillas",
    price: 11.99,
    image_url: "https://images.unsplash.com/photo-1512838243191-e81e8f66f1fd?q=80&w=1000&auto=format&fit=crop",
    is_vegan: false,
    is_vegetarian: false,
    is_spicy: false,
    is_gluten_free: true,
    available_today: true,
    quantity_available: 16
  },
  {
    name: "Buffalo Wings",
    description: "Crispy chicken wings tossed in spicy buffalo sauce, served with celery and blue cheese dip",
    price: 9.99,
    image_url: "https://images.unsplash.com/photo-1608039755401-742074f0548d?q=80&w=1000&auto=format&fit=crop",
    is_vegan: false,
    is_vegetarian: false,
    is_spicy: true,
    is_gluten_free: true,
    available_today: true,
    quantity_available: 20
  },
  {
    name: "Quinoa Bowl",
    description: "Nutritious quinoa with roasted vegetables, avocado, and tahini dressing",
    price: 10.99,
    image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop",
    is_vegan: true,
    is_vegetarian: true,
    is_spicy: false,
    is_gluten_free: true,
    available_today: true,
    quantity_available: 10
  },
  {
    name: "Mac & Cheese",
    description: "Creamy macaroni and cheese with a crispy breadcrumb topping",
    price: 8.99,
    image_url: "https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?q=80&w=1000&auto=format&fit=crop",
    is_vegan: false,
    is_vegetarian: true,
    is_spicy: false,
    is_gluten_free: false,
    available_today: true,
    quantity_available: 15
  },
  {
    name: "Churros",
    description: "Fried dough pastry dusted with cinnamon sugar, served with chocolate dipping sauce",
    price: 5.99,
    image_url: "https://images.unsplash.com/photo-1624371414361-e670edf4898d?q=80&w=1000&auto=format&fit=crop",
    is_vegan: false,
    is_vegetarian: true,
    is_spicy: false,
    is_gluten_free: false,
    available_today: true,
    quantity_available: 30
  }
];

// Function to insert sample data into Supabase
export async function insertSampleData(supabase) {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .insert(sampleMenuItems)
      .select();
      
    if (error) {
      throw error;
    }
    
    console.log('Sample data inserted successfully:', data.length, 'items');
    return data;
  } catch (error) {
    console.error('Error inserting sample data:', error);
    throw error;
  }
}

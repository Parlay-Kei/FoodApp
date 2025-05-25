import { createSupabaseClient, createServiceClient } from '../../../lib/supabase';

export async function POST(request) {
  try {
    // Get regular client for auth
    const supabase = createSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const { user } = session;
    const body = await request.json();
    const { items, total, pickupTime } = body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'No items in cart' }, { status: 400 });
    }
    
    // Get service role client to bypass RLS
    const serviceClient = createServiceClient();
    if (!serviceClient) {
      console.error('Service client unavailable');
      return Response.json({ error: 'Service unavailable' }, { status: 503 });
    }
    
    console.log('Processing checkout with service role client');
    
    // Create order in database using service client
    const { data: order, error: orderError } = await serviceClient
      .from('orders')
      .insert([
        {
          user_id: user.id,
          total,
          status: 'pending',
          pickup_time: pickupTime
        }
      ])
      .select()
      .single();
    
    if (orderError) {
      console.error('Error creating order:', orderError);
      return Response.json({ error: orderError.message }, { status: 500 });
    }
    
    console.log('Order created successfully:', order.id);
    
    // Add order items using service client
    const orderItems = items.map(item => ({
      order_id: order.id,
      menu_item_id: item.id,
      quantity: item.quantity,
      price: item.price
    }));
    
    const { error: itemsError } = await serviceClient
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      console.error('Error adding order items:', itemsError);
      // Still return the order even if there was an error with the items
      return Response.json({ 
        order, 
        warning: 'Order created but there was an error adding some items' 
      });
    }
    
    console.log('Order items added successfully');
    
    // Update inventory (decrement quantity_available)
    for (const item of items) {
      const { error: updateError } = await serviceClient.rpc('decrement_item_quantity', {
        item_id: item.id,
        quantity: item.quantity
      });
      
      if (updateError) {
        console.error(`Error updating quantity for item ${item.id}:`, updateError);
      }
    }
    
    console.log('Inventory updated successfully');
    return Response.json({ order, success: true });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ 
      error: error.message || 'Internal server error',
      details: error.toString()
    }, { status: 500 });
  }
}

import { createSupabaseClient, createServiceClient } from '../../../lib/supabase';

export async function POST(request) {
  try {
    console.log('Checkout API called');
    
    // Get regular client for auth with error handling
    let supabase;
    try {
      supabase = createSupabaseClient();
    } catch (clientError) {
      console.error('Error creating Supabase client:', clientError);
      return Response.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    
    // Get session with error handling
    let session;
    try {
      const { data } = await supabase.auth.getSession();
      session = data.session;
      console.log('Session retrieved:', session ? 'Valid session' : 'No session');
    } catch (sessionError) {
      console.error('Error getting session:', sessionError);
      return Response.json({ error: 'Authentication service unavailable' }, { status: 503 });
    }
    
    if (!session) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const { user } = session;
    
    // Parse request body with error handling
    let items, total, pickupTime;
    try {
      const body = await request.json();
      items = body.items;
      total = body.total;
      pickupTime = body.pickupTime;
      console.log('Request body parsed successfully');
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return Response.json({ error: 'Invalid request format' }, { status: 400 });
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'No items in cart' }, { status: 400 });
    }
    
    // Get service role client to bypass RLS with error handling
    let serviceClient;
    try {
      serviceClient = createServiceClient();
      if (!serviceClient) {
        console.error('Service client unavailable');
        return Response.json({ error: 'Service unavailable' }, { status: 503 });
      }
      console.log('Service client created successfully');
    } catch (serviceClientError) {
      console.error('Error creating service client:', serviceClientError);
      return Response.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    
    console.log('Processing checkout with service role client');
    
    // Create order in database using service client with error handling
    let order;
    try {
      const { data, error } = await serviceClient
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
        
      if (error) {
        console.error('Error creating order:', error);
        return Response.json({ error: error.message || 'Failed to create order' }, { status: 500 });
      }
      
      if (!data) {
        console.error('No order data returned');
        return Response.json({ error: 'Failed to create order' }, { status: 500 });
      }
      
      order = data;
      console.log('Order created successfully:', order.id);
    } catch (orderError) {
      console.error('Exception creating order:', orderError);
      return Response.json({ error: 'Failed to process order' }, { status: 500 });
    }
    
    // Order is now created successfully
    
    // Add order items using service client with error handling
    try {
      // Create order items array
      const orderItems = items.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));
      
      console.log('Inserting order items:', orderItems.length);
      
      // Insert order items
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
    } catch (itemsError) {
      console.error('Exception adding order items:', itemsError);
      // Still return the order even if there was an error with the items
      return Response.json({ 
        order, 
        warning: 'Order created but there was an error adding some items' 
      });
    }
    
    console.log('Order items added successfully');
    
    // Update inventory (decrement quantity_available) with error handling
    try {
      for (const item of items) {
        console.log(`Updating inventory for item ${item.id}, quantity: ${item.quantity}`);
        
        const { error: updateError } = await serviceClient.rpc('decrement_item_quantity', {
          item_id: item.id,
          quantity: item.quantity
        });
        
        if (updateError) {
          console.error(`Error updating quantity for item ${item.id}:`, updateError);
          // Continue with other items even if one fails
        }
      }
      
      console.log('Inventory updated successfully');
    } catch (inventoryError) {
      console.error('Exception updating inventory:', inventoryError);
      // Continue with order confirmation even if inventory update fails
    }
    
    // Send confirmation email (this will be implemented separately)
    try {
      // For now, just log that we would send an email
      console.log(`Would send confirmation email for order ${order.id} to user ${user.email}`);
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
    }
    
    return Response.json({ order, success: true });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ 
      error: error.message || 'Internal server error',
      details: error.toString()
    }, { status: 500 });
  }
}

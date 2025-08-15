const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetDatabase() {
  console.log('🔄 Starting database reset...');
  
  try {
    // Clear all tables in reverse dependency order
    console.log('🗑️  Clearing order_items...');
    await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('🗑️  Clearing orders...');
    await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('🗑️  Clearing menu_items...');
    await supabase.from('menu_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('🗑️  Clearing menus...');
    await supabase.from('menus').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('🗑️  Clearing admin_websites...');
    await supabase.from('admin_websites').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('🗑️  Clearing users...');
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('🗑️  Clearing restaurants...');
    await supabase.from('restaurants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('✅ All tables cleared successfully');
    
    // Create demo restaurant
    console.log('🏪 Creating demo restaurant...');
    const { data: restaurant, error: restError } = await supabase
      .from('restaurants')
      .insert({
        name: 'Demo Restaurant',
        slug: 'demo-restaurant',
        email: 'admin@restaurant.com',
        phone: '555-0123',
        address: '123 Demo Street, Demo City, DC 12345',
        description: 'A demo restaurant for testing MenuCraft',
        is_active: true,
        tax_rate: 0.08,
        currency: 'USD',
        estimated_time_per_item: 5,
        minimum_order_time: 15
      })
      .select()
      .single();
    
    if (restError) {
      throw new Error(`Failed to create restaurant: ${restError.message}`);
    }
    
    console.log('✅ Demo restaurant created:', restaurant.name);
    
    // Create demo admin user
    console.log('👤 Creating demo admin user...');
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        restaurant_id: restaurant.id,
        username: 'admin',
        password_hash: passwordHash,
        role: 'ADMIN',
        email: 'admin@restaurant.com',
        is_active: true
      })
      .select()
      .single();
    
    if (userError) {
      throw new Error(`Failed to create admin user: ${userError.message}`);
    }
    
    console.log('✅ Demo admin user created');
    
    // Create Supabase Auth user for frontend login
    console.log('🔐 Creating Supabase Auth user...');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@restaurant.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        username: 'admin',
        role: 'admin',
        restaurantId: restaurant.id
      }
    });
    
    if (authError) {
      console.warn('⚠️  Failed to create Supabase Auth user:', authError.message);
      console.log('ℹ️  You can manually create the user in Supabase dashboard');
    } else {
      console.log('✅ Supabase Auth user created');
    }
    
    // Create demo menu
    console.log('📋 Creating demo menu...');
    const { data: menu, error: menuError } = await supabase
      .from('menus')
      .insert({
        restaurant_id: restaurant.id,
        name: 'Demo Menu',
        is_active: true
      })
      .select()
      .single();
    
    if (menuError) {
      throw new Error(`Failed to create menu: ${menuError.message}`);
    }
    
    // Create demo menu items
    console.log('🍕 Creating demo menu items...');
    const menuItems = [
      {
        menu_id: menu.id,
        restaurant_id: restaurant.id,
        name: 'Classic Burger',
        price: 12.99,
        description: 'Beef patty with lettuce, tomato, and special sauce',
        category: 'Burgers',
        is_popular: true,
        is_active: true
      },
      {
        menu_id: menu.id,
        restaurant_id: restaurant.id,
        name: 'Margherita Pizza',
        price: 16.99,
        description: 'Fresh mozzarella, tomato sauce, and basil',
        category: 'Pizza',
        is_popular: true,
        is_active: true
      },
      {
        menu_id: menu.id,
        restaurant_id: restaurant.id,
        name: 'Caesar Salad',
        price: 9.99,
        description: 'Romaine lettuce, parmesan, croutons, caesar dressing',
        category: 'Salads',
        is_popular: false,
        is_active: true
      },
      {
        menu_id: menu.id,
        restaurant_id: restaurant.id,
        name: 'Chicken Wings',
        price: 11.99,
        description: 'Crispy wings with your choice of sauce',
        category: 'Appetizers',
        is_popular: true,
        is_active: true
      },
      {
        menu_id: menu.id,
        restaurant_id: restaurant.id,
        name: 'Chocolate Cake',
        price: 6.99,
        description: 'Rich chocolate cake with chocolate frosting',
        category: 'Desserts',
        is_popular: false,
        is_active: true
      }
    ];
    
    const { error: itemsError } = await supabase
      .from('menu_items')
      .insert(menuItems);
    
    if (itemsError) {
      throw new Error(`Failed to create menu items: ${itemsError.message}`);
    }
    
    console.log('✅ Demo menu items created');
    
    console.log('');
    console.log('🎉 Database reset completed successfully!');
    console.log('');
    console.log('📋 Demo Login Credentials:');
    console.log('🌐 Restaurant Slug: demo-restaurant');
    console.log('👤 Username: admin');
    console.log('🔑 Password: admin123');
    console.log('📧 Email: admin@restaurant.com');
    console.log('');
    console.log('🚀 You can now login to:');
    console.log('📊 Admin Dashboard: http://localhost:3000');
    console.log('🍕 Customer App: http://localhost:3002/demo-restaurant');
    console.log('👨‍🍳 Kitchen App: http://localhost:3003/kitchen/demo-restaurant');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
    process.exit(1);
  }
}

resetDatabase();
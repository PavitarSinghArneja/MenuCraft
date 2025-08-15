const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { supabase } = require('./utils/supabase');

// Import routes


const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// ===== AUTH ROUTES =====

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password, restaurantSlug } = req.body;
    
    if (!username || !password || !restaurantSlug) {
      return res.status(400).json({ error: 'Username, password, and restaurant slug are required' });
    }

    // Get restaurant by slug
    const { data: restaurant, error: restError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', restaurantSlug)
      .eq('is_active', true)
      .single();

    if (restError || !restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Get user by username and restaurant
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('restaurant_id', restaurant.id)
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        restaurantId: user.restaurant_id, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        restaurantId: user.restaurant_id
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== RESTAURANT ROUTES =====

// Get restaurant config for customer app
app.get('/api/restaurants/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    // Get restaurant with active menu and items
    const { data: restaurant, error: restError } = await supabase
      .from('restaurants')
      .select(`
        *,
        menus!inner (
          id,
          name,
          menu_items (
            id,
            name,
            price,
            description,
            category,
            image_url,
            dietary_tags,
            is_popular,
            sort_order
          )
        )
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .eq('menus.is_active', true)
      .eq('menus.menu_items.is_active', true)
      .single();

    if (restError || !restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Transform menu items into categories
    const menuItems = restaurant.menus[0]?.menu_items || [];
    const categoriesMap = {};

    menuItems.forEach(item => {
      if (!categoriesMap[item.category]) {
        categoriesMap[item.category] = {
          name: item.category,
          items: []
        };
      }
      categoriesMap[item.category].items.push({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        description: item.description,
        category: item.category,
        image: item.image_url,
        dietary: item.dietary_tags || [],
        popular: item.is_popular
      });
    });

    const config = {
      restaurant: {
        name: restaurant.name,
        phone: restaurant.phone,
        address: restaurant.address,
        description: restaurant.description,
        email: restaurant.email
      },
      menuCategories: Object.values(categoriesMap),
      taxRate: parseFloat(restaurant.tax_rate),
      currency: restaurant.currency,
      estimatedTimePerItem: restaurant.estimated_time_per_item,
      minimumOrderTime: restaurant.minimum_order_time
    };

    res.json(config);

  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new restaurant
app.post('/api/restaurants', async (req, res) => {
  try {
    const restaurantData = req.body;
    
    // Generate slug from name
    const slug = restaurantData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');


    // Supabase mode: Insert restaurant
    const { data: restaurant, error: restError } = await supabase
      .from('restaurants')
      .insert({
        name: restaurantData.name,
        slug: slug,
        email: restaurantData.email,
        phone: restaurantData.phone,
        address: restaurantData.address,
        description: restaurantData.description,
        domain: restaurantData.domain
      })
      .select()
      .single();

    if (restError) {
      console.error('Restaurant creation error:', restError);
      return res.status(400).json({ error: restError.message });
    }

    // Create default admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    await supabase
      .from('users')
      .insert({
        restaurant_id: restaurant.id,
        username: 'admin',
        password_hash: passwordHash,
        role: 'ADMIN',
        email: restaurantData.email
      });

    const credentials = {
      username: 'admin',
      password: 'admin123',
      kitchenUrl: `http://localhost:3003/kitchen/${slug}`,
      orderingUrl: `http://localhost:3002/${slug}`
    };

    res.status(201).json({
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        email: restaurant.email,
        phone: restaurant.phone,
        address: restaurant.address,
        description: restaurant.description,
        domain: restaurant.domain,
        isActive: restaurant.is_active,
        createdAt: restaurant.created_at,
        updatedAt: restaurant.updated_at
      },
      credentials: credentials
    });

  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== MENU ROUTES =====

app.post('/api/menus/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const menuData = req.body;


    // Supabase mode: Deactivate existing menus
    await supabase
      .from('menus')
      .update({ is_active: false })
      .eq('restaurant_id', restaurantId);

    // Create new menu
    const { data: menu, error: menuError } = await supabase
      .from('menus')
      .insert({
        restaurant_id: restaurantId,
        name: menuData.name || 'Main Menu',
        is_active: true
      })
      .select()
      .single();

    if (menuError) {
      console.error('Menu creation error:', menuError);
      return res.status(400).json({ error: menuError.message });
    }

    // Insert menu items
    const menuItems = [];
    if (menuData.categories && Array.isArray(menuData.categories)) {
      for (const category of menuData.categories) {
        if (category.items && Array.isArray(category.items)) {
          for (const item of category.items) {
            menuItems.push({
              menu_id: menu.id,
              restaurant_id: restaurantId,
              name: item.name,
              price: item.price,
              description: item.description,
              category: item.category,
              dietary_tags: item.dietary || [],
              is_popular: item.popular || false,
              is_active: true
            });
          }
        }
      }
    }

    if (menuItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('menu_items')
        .insert(menuItems);

      if (itemsError) {
        console.error('Menu items creation error:', itemsError);
        return res.status(400).json({ error: itemsError.message });
      }
    }

    res.status(201).json({
      id: menu.id,
      restaurantId: menu.restaurant_id,
      name: menu.name,
      isActive: menu.is_active,
      createdAt: menu.created_at,
      updatedAt: menu.updated_at
    });

  } catch (error) {
    console.error('Error saving menu:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== ORDER ROUTES =====

// Place new order
app.post('/api/orders/restaurant/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const orderData = req.body;

    // Get restaurant
    const { data: restaurant, error: restError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (restError || !restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        restaurant_id: restaurant.id,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        order_type: orderData.orderType,
        table_number: orderData.tableNumber,
        car_color: orderData.carColor,
        license_plate: orderData.licensePlate,
        car_model: orderData.carModel,
        special_notes: orderData.specialNotes,
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        total: orderData.total
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return res.status(400).json({ error: orderError.message });
    }

    // Insert order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      menu_item_id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
      customizations: item.customizations || []
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items creation error:', itemsError);
      return res.status(400).json({ error: itemsError.message });
    }

    // Emit to kitchen via Socket.IO
    io.to(`restaurant-${restaurant.id}`).emit('order:new', {
      ...order,
      items: orderItems
    });

    res.status(201).json({
      id: order.id,
      orderNumber: order.order_number,
      restaurantId: order.restaurant_id,
      status: order.status,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      orderType: order.order_type,
      tableNumber: order.table_number,
      carColor: order.car_color,
      licensePlate: order.license_plate,
      carModel: order.car_model,
      specialNotes: order.special_notes,
      items: orderItems,
      subtotal: parseFloat(order.subtotal),
      tax: parseFloat(order.tax),
      total: parseFloat(order.total),
      placedAt: order.placed_at,
      startedAt: order.started_at,
      completedAt: order.completed_at
    });

  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get orders for kitchen
app.get('/api/orders/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { status, limit = '50' } = req.query;

    // Get restaurant
    const { data: restaurant, error: restError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (restError || !restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Build query
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('restaurant_id', restaurant.id)
      .order('placed_at', { ascending: false })
      .limit(parseInt(limit));

    if (status) {
      query = query.eq('status', status.toUpperCase());
    }

    const { data: orders, error: ordersError } = await query;

    if (ordersError) {
      console.error('Orders fetch error:', ordersError);
      return res.status(400).json({ error: ordersError.message });
    }

    // Transform to expected format
    const transformedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      restaurantId: order.restaurant_id,
      status: order.status,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      orderType: order.order_type,
      tableNumber: order.table_number,
      carColor: order.car_color,
      licensePlate: order.license_plate,
      carModel: order.car_model,
      specialNotes: order.special_notes,
      items: order.order_items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price),
        subtotal: parseFloat(item.subtotal),
        customizations: item.customizations
      })),
      subtotal: parseFloat(order.subtotal),
      tax: parseFloat(order.tax),
      total: parseFloat(order.total),
      placedAt: order.placed_at,
      startedAt: order.started_at,
      completedAt: order.completed_at
    }));

    res.json(transformedOrders);

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update order status
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updates = { status };
    const currentTime = new Date().toISOString();

    if (status === 'IN_PROGRESS') {
      updates.started_at = currentTime;
    } else if (status === 'COMPLETED') {
      updates.completed_at = currentTime;
    }

    const { data: order, error: updateError } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        order_items (*)
      `)
      .single();

    if (updateError) {
      console.error('Order update error:', updateError);
      return res.status(400).json({ error: updateError.message });
    }

    // Emit update via Socket.IO
    io.to(`restaurant-${order.restaurant_id}`).emit('order:updated', order);

    res.json({
      id: order.id,
      orderNumber: order.order_number,
      restaurantId: order.restaurant_id,
      status: order.status,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      orderType: order.order_type,
      tableNumber: order.table_number,
      carColor: order.car_color,
      licensePlate: order.license_plate,
      carModel: order.car_model,
      specialNotes: order.special_notes,
      items: order.order_items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price),
        subtotal: parseFloat(item.subtotal),
        customizations: item.customizations
      })),
      subtotal: parseFloat(order.subtotal),
      tax: parseFloat(order.tax),
      total: parseFloat(order.total),
      placedAt: order.placed_at,
      startedAt: order.started_at,
      completedAt: order.completed_at
    });

  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== UTILITY ROUTES =====

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>MenuCraft Backend with Supabase!</h1>
        <p>Time: ${new Date().toISOString()}</p>
        <button onclick="testAPI()">Test API Call</button>
        <div id="result"></div>
        <script>
          function testAPI() {
            fetch('/api/health')
              .then(r => r.json())
              .then(data => {
                document.getElementById('result').innerHTML = 
                  '<h3>API Response:</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
              })
              .catch(err => {
                document.getElementById('result').innerHTML = 
                  '<h3>Error:</h3><pre>' + err.message + '</pre>';
              });
          }
        </script>
      </body>
    </html>
  `);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  socket.on('join:restaurant', (restaurantId) => {
    socket.join(`restaurant-${restaurantId}`);
    console.log(`Socket ${socket.id} joined restaurant-${restaurantId}`);
  });
  
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 MenuCraft Backend running on port ${PORT}`);
  
  console.log('✅ Connected to Supabase database');
  console.log('');
  
  console.log('🌐 Applications:');
  console.log(`📊 Admin Dashboard: http://localhost:3000`);
  console.log(`🍕 Customer App: http://localhost:3002/pizza-palace`);
  console.log(`👨‍🍳 Kitchen App: http://localhost:3003/kitchen/pizza-palace`);
  console.log('');
  console.log('🔐 Default Login Credentials:');
  console.log('Username: admin');
  console.log('Password: admin123');
  console.log('Restaurant Slug: pizza-palace');
});

module.exports = { app, io };
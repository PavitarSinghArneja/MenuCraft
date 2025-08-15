# MenuCraft 🍽️

A comprehensive restaurant management system that allows restaurants to create AI-powered ordering websites from menu images. The system generates customer ordering websites and kitchen dashboards automatically.

## 🌟 Features

- **AI Menu Extraction**: Upload menu images and extract items using Google AI
- **Website Generation**: Create customer ordering websites and kitchen dashboards
- **Multi-App Architecture**: Separate apps for Admin, Customer, and Kitchen workflows
- **Real-time Orders**: Socket.IO powered real-time order management
- **Supabase Integration**: Cloud database for data persistence
- **Session Management**: 24-hour session persistence for admin users

### Core Workflow
1. **Admin uploads menu image** → Gemini AI extracts menu data
2. **Restaurant setup** → Creates database entry with unique slug
3. **Websites generated** → Customer ordering site + Kitchen dashboard instantly available
4. **Real-time operations** → Orders flow from customers to kitchen in real-time

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin Dashboard   │    │   Backend API       │    │   Database          │
│   (Port 3000)      │◄──►│   (Port 3001)       │◄──►│   PostgreSQL        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼────┐  ┌───────▼────┐  ┌──────▼──────┐
        │  Customer   │  │   Kitchen   │  │  Socket.IO  │
        │ Ordering    │  │ Dashboard   │  │ Real-time   │
        │(Port 3002)  │  │(Port 3003)  │  │  Updates    │
        └────────────┘  └────────────┘  └─────────────┘
```

## 🚀 Key Features Implemented

### ✅ Backend Foundation
- **Node.js/Express** API with JavaScript
- **Supabase PostgreSQL** database with real-time capabilities
- **JWT Authentication** for restaurant staff
- **Socket.IO** for real-time order updates
- **RESTful APIs** for all restaurant operations

### ✅ Template System
- **Dynamic restaurant routing** via slugs (`/restaurant-name`)
- **Real-time menu loading** from database
- **Brand customization** (colors, logos, themes)
- **Multi-tenant architecture** supporting unlimited restaurants

### ✅ Customer Ordering Website
- **Dynamic configuration** loading based on URL slug
- **Real order placement** to backend API
- **Restaurant-specific theming** and branding
- **Mobile-responsive** design maintained

### ✅ Kitchen Dashboard
- **Real-time order management** with live updates
- **Restaurant authentication** with JWT tokens
- **Order status workflow** (Pending → In Progress → Completed)
- **Restaurant-specific** order filtering

### ✅ Admin Dashboard Integration
- **Gemini AI menu processing** (existing feature maintained)
- **Restaurant setup workflow** after menu extraction
- **Automatic website generation** with unique URLs
- **Credential management** for restaurant access

## 📁 Project Structure

```
MenuCraft/
├── Admin/          # Admin dashboard (React app)
├── Customer/       # Customer ordering site (React app)  
├── Kitchen/        # Kitchen management (React app)
├── backend/        # Express.js API server
│   ├── src/
│   │   ├── index.js      # Main server file
│   │   └── utils/        # Utilities and services
│   └── scripts/          # Database scripts
├── package.json    # Root package for convenience scripts
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend
- **Express.js** with Node.js
- **Socket.IO** for real-time communication
- **Supabase** for database and auth
- **Google AI** for menu extraction
- **JWT** for authentication

### Database
- **Supabase** (PostgreSQL)
- Tables: `admin_websites`, `restaurants`, `menu_items`, `orders`, `users`

## 🛠️ Database Schema (Supabase)

```sql
-- Core restaurant data
restaurants (id, name, slug, email, colors, domain, active, tax_rate, currency)

-- Menu configurations per restaurant  
menus (id, restaurant_id, name, is_active)
menu_items (id, menu_id, restaurant_id, name, price, description, category)

-- Real-time order management
orders (id, order_number, restaurant_id, customer_info, status, timestamps)
order_items (id, order_id, menu_item_id, name, quantity, price, subtotal)

-- Kitchen dashboard authentication
users (id, restaurant_id, username, password_hash, role)
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Supabase account
- Google AI API key

### 1. Environment Setup

Create `.env` files in each directory:

**Admin/.env:**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_google_ai_key
```

**backend/.env:**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret
PORT=5001
GOOGLE_API_KEY=your_google_ai_key
```

### 2. Database Setup

Create the `admin_websites` table in your Supabase dashboard:

```sql
CREATE TABLE admin_websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  customer_url TEXT NOT NULL,
  kitchen_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  menu_items INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  last_order_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_websites_user_id ON admin_websites(user_id);
CREATE INDEX idx_admin_websites_slug ON admin_websites(slug);
```

### 3. Install Dependencies

```bash
# Install all dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install admin dependencies  
cd ../Admin && npm install

# Install customer dependencies
cd ../Customer && npm install

# Install kitchen dependencies
cd ../Kitchen && npm install
```

### 4. Initialize Demo Data

```bash
cd backend && node scripts/reset-database.js
```

This creates a demo admin user:
- Email: `admin@restaurant.com`
- Password: `admin123`

### 5. Start All Services

```bash
# Start backend (port 5001)
cd backend && npm start

# Start admin app (port 3001) 
cd Admin && npm run dev

# Start customer app (port 3002)
cd Customer && npm run dev

# Start kitchen app (port 3003)
cd Kitchen && npm run dev
```

## 🎯 Usage Workflow

1. **Admin Login**: Access admin dashboard at `http://localhost:3001`
2. **Upload Menu**: Upload a menu image and let AI extract items
3. **Generate Website**: Configure restaurant details and generate websites
4. **Customer Orders**: Customers place orders via the generated ordering site
5. **Kitchen Management**: Kitchen staff manage orders through the kitchen dashboard

## 🔗 API Endpoints

### Restaurant Management
- `POST /api/restaurants` - Create new restaurant
- `GET /api/restaurants/:slug` - Get restaurant config for customer app
- `PUT /api/restaurants/:id` - Update restaurant details

### Menu Management  
- `POST /api/menus/:restaurantId` - Save processed menu data
- `GET /api/menus/slug/:slug` - Get menu for customer ordering

### Order Management
- `POST /api/orders/restaurant/:slug` - Place new order
- `GET /api/orders/slug/:slug` - Get orders for kitchen dashboard  
- `PUT /api/orders/:id/status` - Update order status

### Authentication
- `POST /api/auth/login` - Kitchen staff login
- `POST /api/auth/users` - Create kitchen staff accounts

## 🎨 Template Customization

### Restaurant-Specific Theming
- **Primary/Secondary colors** from Gemini extraction
- **Logo upload support** (ready for implementation)
- **Custom domains** (database field ready)
- **Hours, contact info** dynamically displayed

### URL Routing Options
- **Path-based**: `yourdomain.com/restaurant-slug`
- **Subdomain**: `restaurant-slug.yourdomain.com` (DNS setup required)

## ⚡ Real-Time Features

### Socket.IO Integration
- **Order notifications** to kitchen dashboard
- **Status updates** to customer apps  
- **Connection management** by restaurant
- **Automatic reconnection** handling

### Order Flow
```
Customer Places Order → Database → Socket Broadcast → Kitchen Dashboard
Kitchen Updates Status → Database → Socket Broadcast → Customer App  
```

## 🚢 Deployment

The apps can be deployed to various platforms:

- **Frontend Apps**: Netlify, Vercel, or any static hosting
- **Backend**: Railway, Render, or any Node.js hosting
- **Database**: Supabase (already cloud-hosted)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google AI for menu extraction capabilities
- Supabase for backend infrastructure
- React and Vite communities for excellent tooling
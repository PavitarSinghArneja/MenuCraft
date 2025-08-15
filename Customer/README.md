# Restaurant Ordering Website Template

A modern, responsive restaurant ordering website template built with React, TypeScript, and Tailwind CSS. This template provides a complete customer ordering experience that **dynamically generates restaurant-specific websites** based on configuration data.

## 🚀 Dynamic Template System

This template is designed to work with **any restaurant's data**. Simply provide restaurant configuration and menu data, and the system will generate a fully customized ordering website.

### Configuration Sources (Priority Order)
1. **URL Parameters**: `?config=base64config` or `?restaurant_id=123`
2. **Local Storage**: Cached configuration for performance
3. **API Endpoint**: `/api/restaurant/config` or `/config.json`
4. **Environment Variables**: `VITE_RESTAURANT_CONFIG`
5. **Default Fallback**: Sample restaurant data

## Features

### Core Functionality
- **Mobile-first responsive design** optimized for phone ordering
- **Expandable menu categories** with search functionality
- **Shopping cart** with persistent session storage
- **Conditional customer forms** (dine-in with table number OR drive-in with car details)
- **Real-time calculations** including tax and totals
- **Order confirmation** with estimated preparation time

### Menu System
- Organized categories (Appetizers, Pizza, Main Courses, Desserts, Beverages)
- Item details with prices, descriptions, and dietary indicators
- Search functionality across all menu items
- Popular item highlighting
- Dietary restriction badges (vegetarian, gluten-free)

### Order Types
- **Dine-In Orders**: Requires table number
- **Drive-In Orders**: Requires car color, license plate, and optional make/model
- Smooth transitions between order types
- Form validation for required fields

### Shopping Cart
- Floating cart icon with live item count
- Add/remove items with quantity controls
- Running totals with tax calculation (8.5% default)
- Session storage persistence
- Cart sidebar with full order summary

### Design Features
- Professional restaurant branding aesthetic
- Warm color scheme (customizable via CSS variables)
- Touch-friendly interface (44px minimum touch targets)
- Smooth animations and micro-interactions
- Modern typography using Inter font
- Accessible design with proper contrast ratios

## 🔧 Template Customization

### Restaurant Information
Provide restaurant configuration via any supported method:

```typescript
const restaurantConfig = {
  restaurant: {
    name: "Your Restaurant Name",
    phone: "+1 (555) 123-4567", 
    address: "123 Your Street, Your City",
    primaryColor: "#your-primary-color",
    secondaryColor: "#your-secondary-color",
    description: "Your restaurant description",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    email: "info@yourrestaurant.com",
    logo: "https://your-logo-url.com/logo.png"
  },
  menuCategories: [...],
  taxRate: 0.085,
  currency: "USD",
  estimatedTimePerItem: 8,
  minimumOrderTime: 15
};
```

### Menu Items
Define your menu structure:

```typescript
const menuCategories = [
  {
    name: "Your Category",
    items: [
      {
        id: "item1",
        name: "Your Item",
        price: 19.99,
        description: "Your description",
        category: "Your Category",
        image: "https://your-image-url.com/item.jpg",
        dietary: ['vegetarian'], // optional
        popular: true // optional
      }
    ]
  }
];
```

## 🌐 Deployment Methods

### Method 1: Configuration File
Create a `public/config.json` file:

```json
{
  "restaurant": {
    "name": "Your Restaurant",
    "phone": "+1 (555) 123-4567",
    "address": "123 Main Street",
    "primaryColor": "#e74c3c",
    "secondaryColor": "#2c3e50"
  },
  "menuCategories": [...],
  "taxRate": 0.085
}
```

### Method 2: Environment Variables
Set `VITE_RESTAURANT_CONFIG` with your configuration:

```bash
VITE_RESTAURANT_CONFIG='{"restaurant":{"name":"Your Restaurant",...}}'
```

### Method 3: URL Parameters
Generate shareable URLs with embedded configuration:

```javascript
// Generate URL with configuration
const shareableUrl = generateShareableUrl(yourConfig);
// Result: https://yoursite.com?config=eyJyZXN0YXVyYW50Ijp7Im5hbWUi...
```

### Method 4: API Integration
Set up an API endpoint that returns restaurant configuration:

```javascript
// GET /api/restaurant/123
{
  "restaurant": {...},
  "menuCategories": [...],
  "taxRate": 0.085
}
```

## 🛠️ Development Setup

### Quick Start
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Custom Configuration
```bash
# Run with custom config file
cp your-restaurant-config.json public/config.json
npm run dev

# Run with environment config
VITE_RESTAURANT_CONFIG='{"restaurant":{"name":"Test Restaurant"}}' npm run dev

# Run with URL config
# Visit: http://localhost:5173?restaurant_id=your-restaurant-id
```

## 📦 Build for Production

```bash
# Build with embedded configuration
npm run build

# Build with specific restaurant config
VITE_RESTAURANT_CONFIG='$(cat your-config.json)' npm run build
```

## 🔧 Template Generation API

The template includes utilities for programmatic generation:

```typescript
import { generateDeploymentConfig, validateConfigForDeployment } from './src/utils/templateGenerator';

// Validate configuration
const validation = validateConfigForDeployment(yourConfig);
if (!validation.isValid) {
  console.error('Configuration errors:', validation.errors);
}

// Generate deployment files
const deployment = generateDeploymentConfig(yourConfig);
// Returns: { configJson, envFile, htmlTemplate }
```

## 🏗️ Technical Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for development and building
- **Session Storage** for cart persistence
- **Dynamic Configuration Loading** with multiple fallback sources
- **Template Generation Utilities** for automated deployment

## 🚀 Integration Examples

### SaaS Platform Integration
```typescript
// Load restaurant data from your platform
const restaurantData = await fetch(`/api/restaurants/${restaurantId}`);
const config = await restaurantData.json();

// Generate custom ordering site
window.location.href = `https://ordering.yourplatform.com?config=${btoa(JSON.stringify(config))}`;
```

### Multi-tenant Deployment
```typescript
// Route-based restaurant loading
const restaurantSlug = window.location.pathname.split('/')[1];
const config = await loadRestaurantConfig(restaurantSlug);
```

### White-label Solution
```typescript
// Brand-specific theming
const brandConfig = {
  ...baseConfig,
  restaurant: {
    ...baseConfig.restaurant,
    primaryColor: brandColors.primary,
    secondaryColor: brandColors.secondary
  }
};
```

## Order Flow

1. **Browse Menu**: Customers browse categorized menu items
2. **Add to Cart**: Items are added with quantity controls
3. **Select Order Type**: Choose between dine-in or drive-in
4. **Customer Info**: Conditional form based on order type
5. **Order Summary**: Review complete order with totals
6. **Place Order**: Confirmation with order number and estimated time

## 📡 API Integration Ready

The template structures order data for easy API integration:

```typescript
const orderData = {
  restaurant_id: "rest_001",
  customer: {
    name: "John Doe",
    phone: "+1234567890", 
    orderType: "dine-in",
    tableNumber: "12",
    notes: "Extra sauce"
  },
  items: [...],
  totals: {
    subtotal: 37.98,
    tax: 3.23, 
    total: 41.21
  },
  timestamp: new Date().toISOString(),
  orderNumber: "ORD-123456789"
};
```

## 📁 File Structure

```
src/
├── components/
│   ├── Header.tsx          # Restaurant header with cart
│   ├── MenuSection.tsx     # Menu display with categories
│   ├── MenuItem.tsx        # Individual menu item
│   ├── Cart.tsx           # Shopping cart sidebar
│   ├── CustomerForm.tsx   # Customer info form
│   └── OrderSummary.tsx   # Final order review
├── data/
│   └── restaurant.ts      # Default/fallback data
├── services/
│   └── configLoader.ts    # Dynamic configuration loading
├── hooks/
│   ├── useRestaurantConfig.ts # Configuration management
│   └── useCart.ts         # Cart state management
├── utils/
│   ├── templateGenerator.ts # Template generation utilities
│   └── calculations.ts    # Price and tax calculations
├── types/
│   └── index.ts           # TypeScript interfaces
├── utils/
│   └── calculations.ts    # Price and tax calculations
└── App.tsx                # Main application component
```

## 📱 Mobile Optimization

- Touch-friendly buttons (minimum 44px)
- Optimized for one-handed use
- Fast loading on slow connections
- Responsive breakpoints for all devices
- Swipe gestures for category navigation

## 🌐 Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers

## 🔒 Configuration Security

- Configuration data is validated and sanitized
- Sensitive data should be handled server-side
- URL-based configs are base64 encoded (not encrypted)
- Use HTTPS for production deployments
- API endpoints should implement proper authentication

## 🆘 Troubleshooting

- **Configuration not loading**: Check browser console for errors
- **Styling issues**: Verify color values are valid hex codes
- **Menu not displaying**: Ensure menu categories array is properly formatted
- **API errors**: Check network tab and API endpoint responses

## 📄 License

This template is ready for commercial use. Create unlimited restaurant ordering sites with dynamic configuration!
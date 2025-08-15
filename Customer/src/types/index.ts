export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
  category: string;
  dietary?: ('vegetarian' | 'gluten-free' | 'vegan')[];
  popular?: boolean;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface CartItem extends MenuItem {
  quantity: number;
  subtotal: number;
}

export interface Restaurant {
  name: string;
  phone: string;
  address: string;
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  description?: string;
  hours?: string;
  email?: string;
  website?: string;
}

export interface Customer {
  name: string;
  phone: string;
  orderType: 'dine-in' | 'drive-in';
  tableNumber?: string;
  carColor?: string;
  licensePlate?: string;
  carModel?: string;
  notes?: string;
}

export interface OrderTotals {
  subtotal: number;
  tax: number;
  total: number;
}

export interface Order {
  restaurant_id: string;
  customer: Customer;
  items: CartItem[];
  totals: OrderTotals;
  timestamp: string;
  orderNumber: string;
}

export interface RestaurantConfig {
  restaurant: Restaurant;
  menuCategories: MenuCategory[];
  taxRate?: number;
  currency?: string;
  estimatedTimePerItem?: number;
  minimumOrderTime?: number;
}
import { Order, CartItem, Customer } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  orderType: 'DINE_IN' | 'DRIVE_IN' | 'TAKEOUT';
  tableNumber?: string;
  carColor?: string;
  licensePlate?: string;
  carModel?: string;
  specialNotes?: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
    customizations?: string[];
  }[];
  subtotal: number;
  tax: number;
  total: number;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  restaurantId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  customerName: string;
  customerPhone: string;
  orderType: 'DINE_IN' | 'DRIVE_IN' | 'TAKEOUT';
  tableNumber?: string;
  carColor?: string;
  licensePlate?: string;
  carModel?: string;
  specialNotes?: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
    customizations?: string[];
  }[];
  subtotal: number;
  tax: number;
  total: number;
  placedAt: string;
  startedAt?: string;
  completedAt?: string;
}

/**
 * Place a new order for a restaurant
 */
export async function placeOrder(
  restaurantSlug: string, 
  items: CartItem[], 
  customer: Customer, 
  totals: { subtotal: number; tax: number; total: number }
): Promise<OrderResponse> {
  try {
    // Convert cart items to order items format
    const orderItems = items.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
      customizations: []
    }));

    // Convert order type to backend format
    let orderType: 'DINE_IN' | 'DRIVE_IN' | 'TAKEOUT' = 'DINE_IN';
    if (customer.orderType === 'drive-in') {
      orderType = 'DRIVE_IN';
    } else if (customer.orderType === 'dine-in') {
      orderType = 'DINE_IN';
    }

    const orderData: CreateOrderRequest = {
      customerName: customer.name,
      customerPhone: customer.phone,
      orderType,
      tableNumber: customer.tableNumber,
      carColor: customer.carColor,
      licensePlate: customer.licensePlate,
      carModel: customer.carModel,
      specialNotes: customer.notes,
      items: orderItems,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total
    };

    const response = await fetch(`${API_URL}/api/orders/restaurant/${restaurantSlug}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const order: OrderResponse = await response.json();
    return order;

  } catch (error) {
    console.error('Error placing order:', error);
    throw error instanceof Error ? error : new Error('Failed to place order');
  }
}

/**
 * Get order status by order number
 */
export async function getOrderStatus(orderId: string): Promise<OrderResponse> {
  try {
    const response = await fetch(`${API_URL}/api/orders/${orderId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching order status:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch order status');
  }
}

/**
 * Convert Customer app types to backend format
 */
export function getRestaurantSlugFromUrl(): string | null {
  const path = window.location.pathname;
  const slug = path.split('/')[1];
  return slug && slug !== '' ? slug : null;
}
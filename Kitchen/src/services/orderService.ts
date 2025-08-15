const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  customizations?: string[];
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
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  placedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export type OrderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

/**
 * Get restaurant slug from URL path
 */
export function getRestaurantSlugFromUrl(): string | null {
  const path = window.location.pathname;
  // Support both /kitchen/slug and /slug patterns
  const segments = path.split('/').filter(Boolean);
  
  if (segments.includes('kitchen')) {
    const kitchenIndex = segments.indexOf('kitchen');
    return segments[kitchenIndex + 1] || null;
  }
  
  return segments[0] || null;
}

/**
 * Fetch orders for a restaurant by slug
 */
export async function fetchOrdersBySlug(
  slug: string, 
  status?: OrderStatus, 
  limit: number = 50
): Promise<OrderResponse[]> {
  try {
    const url = new URL(`${API_URL}/api/orders/slug/${slug}`);
    if (status) url.searchParams.set('status', status);
    url.searchParams.set('limit', limit.toString());

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch orders');
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string, 
  status: OrderStatus
): Promise<OrderResponse> {
  try {
    const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error instanceof Error ? error : new Error('Failed to update order status');
  }
}

/**
 * Delete an order
 */
export async function deleteOrder(orderId: string, authToken: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      }
    });

    if (!response.ok && response.status !== 404) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error instanceof Error ? error : new Error('Failed to delete order');
  }
}

/**
 * Login to kitchen dashboard
 */
export async function loginKitchen(
  username: string, 
  password: string, 
  restaurantSlug: string
): Promise<{
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
    restaurantId: string;
  };
}> {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        restaurantSlug
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(errorData.error || 'Login failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error instanceof Error ? error : new Error('Login failed');
  }
}

/**
 * Convert backend order format to kitchen app format
 */
export function convertOrderFormat(order: OrderResponse) {
  return {
    id: order.id,
    timestamp: order.placedAt,
    status: order.status.toLowerCase().replace('_', '-') as 'pending' | 'in-progress' | 'completed',
    customer: {
      name: order.customerName,
      phone: order.customerPhone,
      orderType: order.orderType.toLowerCase().replace('_', '-') as 'dine-in' | 'drive-in',
      tableNumber: order.tableNumber,
      carColor: order.carColor,
      licensePlate: order.licensePlate,
      carModel: order.carModel
    },
    items: order.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      customizations: item.customizations || [],
      subtotal: item.subtotal
    })),
    totals: {
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total
    },
    specialNotes: order.specialNotes,
    estimatedTime: "20-25 minutes", // Default estimate
    startedAt: order.startedAt,
    completedAt: order.completedAt
  };
}
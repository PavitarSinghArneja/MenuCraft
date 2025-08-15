export interface Customer {
  name: string;
  phone: string;
  orderType: 'dine-in' | 'drive-in';
  tableNumber?: string;
  carColor?: string;
  licensePlate?: string;
  carModel?: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  customizations?: string[];
  subtotal: number;
}

export interface OrderTotals {
  subtotal: number;
  tax: number;
  total: number;
}

export type OrderStatus = 'pending' | 'in-progress' | 'completed';

export interface Order {
  id: string;
  timestamp: string;
  status: OrderStatus;
  customer: Customer;
  items: OrderItem[];
  totals: OrderTotals;
  specialNotes?: string;
  estimatedTime?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface Restaurant {
  name: string;
  location: string;
  phone: string;
}

export interface StatusWorkflow {
  [key: string]: {
    nextStatus: OrderStatus | null;
    buttonText: string;
    buttonColor: string;
    allowedActions: string[];
  };
}

export interface User {
  username: string;
  isAuthenticated: boolean;
}
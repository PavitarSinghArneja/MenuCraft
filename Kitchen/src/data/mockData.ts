import { Order, Restaurant } from '../types';

export const restaurant: Restaurant = {
  name: "Mario's Pizzeria",
  location: "Downtown Location",
  phone: "+1 (555) 123-4567"
};

export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    status: "pending",
    customer: {
      name: "John Smith",
      phone: "+1234567890",
      orderType: "dine-in",
      tableNumber: "12"
    },
    items: [
      {
        name: "Margherita Pizza",
        quantity: 2,
        price: 18.99,
        customizations: ["Extra cheese", "Thin crust"],
        subtotal: 37.98
      },
      {
        name: "Garlic Bread",
        quantity: 1,
        price: 8.99,
        subtotal: 8.99
      }
    ],
    totals: {
      subtotal: 46.97,
      tax: 3.99,
      total: 50.96
    },
    specialNotes: "Customer has nut allergy - please avoid cross contamination",
    estimatedTime: "20-25 minutes"
  },
  {
    id: "ORD-002",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    status: "in-progress",
    customer: {
      name: "Sarah Johnson",
      phone: "+1987654321",
      orderType: "drive-in",
      carColor: "Red",
      licensePlate: "ABC123",
      carModel: "Toyota Camry"
    },
    items: [
      {
        name: "Pepperoni Pizza (Large)",
        quantity: 1,
        price: 22.99,
        customizations: ["Extra pepperoni"],
        subtotal: 22.99
      },
      {
        name: "Caesar Salad",
        quantity: 2,
        price: 12.99,
        subtotal: 25.98
      }
    ],
    totals: {
      subtotal: 48.97,
      tax: 4.16,
      total: 53.13
    },
    specialNotes: "No onions on the pizza",
    estimatedTime: "25-30 minutes",
    startedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: "ORD-003",
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 minutes ago
    status: "completed",
    customer: {
      name: "Mike Wilson",
      phone: "+1122334455",
      orderType: "dine-in",
      tableNumber: "8"
    },
    items: [
      {
        name: "Hawaiian Pizza (Medium)",
        quantity: 1,
        price: 19.99,
        subtotal: 19.99
      },
      {
        name: "Mozzarella Sticks",
        quantity: 1,
        price: 9.99,
        subtotal: 9.99
      },
      {
        name: "Soft Drinks",
        quantity: 3,
        price: 2.99,
        subtotal: 8.97
      }
    ],
    totals: {
      subtotal: 38.95,
      tax: 3.31,
      total: 42.26
    },
    estimatedTime: "20-25 minutes",
    startedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: "ORD-004",
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    status: "pending",
    customer: {
      name: "Lisa Chen",
      phone: "+1555666777",
      orderType: "drive-in",
      carColor: "Blue",
      licensePlate: "XYZ789",
      carModel: "Honda Civic"
    },
    items: [
      {
        name: "Vegetarian Pizza (Large)",
        quantity: 1,
        price: 21.99,
        customizations: ["No mushrooms", "Extra olives"],
        subtotal: 21.99
      },
      {
        name: "Wings (12 pieces)",
        quantity: 1,
        price: 16.99,
        customizations: ["Buffalo sauce"],
        subtotal: 16.99
      }
    ],
    totals: {
      subtotal: 38.98,
      tax: 3.31,
      total: 42.29
    },
    specialNotes: "RUSH ORDER - VIP customer",
    estimatedTime: "20-25 minutes"
  },
  {
    id: "ORD-005",
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 minutes ago
    status: "in-progress",
    customer: {
      name: "Robert Brown",
      phone: "+1888999000",
      orderType: "dine-in",
      tableNumber: "15"
    },
    items: [
      {
        name: "Meat Lovers Pizza (Large)",
        quantity: 1,
        price: 24.99,
        subtotal: 24.99
      },
      {
        name: "Onion Rings",
        quantity: 1,
        price: 7.99,
        subtotal: 7.99
      }
    ],
    totals: {
      subtotal: 32.98,
      tax: 2.80,
      total: 35.78
    },
    specialNotes: "Well done pizza please",
    estimatedTime: "25-30 minutes",
    startedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString()
  }
];
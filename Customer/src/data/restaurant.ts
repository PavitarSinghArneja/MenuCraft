import { Restaurant, MenuCategory, RestaurantConfig } from '../types';

// This file now serves as a fallback/example configuration
// The actual data will be loaded dynamically via configLoader service

export const defaultRestaurant: Restaurant = {
  name: "Mario's Pizzeria",
  phone: "+1 (555) 123-4567",
  address: "123 Main Street, Downtown",
  primaryColor: "#3E2522",
  secondaryColor: "#8C6E63",
  description: "Authentic Italian cuisine made with love",
  hours: "Mon-Sun: 11:00 AM - 10:00 PM",
  email: "info@mariospizzeria.com"
};

export const defaultMenuCategories: MenuCategory[] = [
  {
    name: "Appetizers",
    items: [
      {
        id: "app1",
        name: "Garlic Bread",
        price: 8.99,
        description: "Fresh baked bread with garlic butter and herbs",
        category: "Appetizers",
        dietary: ['vegetarian']
      },
      {
        id: "app2",
        name: "Mozzarella Sticks",
        price: 12.99,
        description: "Crispy breaded mozzarella with marinara sauce",
        category: "Appetizers",
        dietary: ['vegetarian']
      },
      {
        id: "app3",
        name: "Buffalo Wings",
        price: 14.99,
        description: "Spicy buffalo wings with celery and blue cheese",
        category: "Appetizers",
        popular: true
      },
      {
        id: "app4",
        name: "Bruschetta",
        price: 10.99,
        description: "Toasted bread with fresh tomatoes, basil, and mozzarella",
        category: "Appetizers",
        dietary: ['vegetarian']
      }
    ]
  },
  {
    name: "Pizza",
    items: [
      {
        id: "pizza1",
        name: "Margherita",
        price: 18.99,
        description: "Fresh mozzarella, tomatoes, basil, olive oil",
        category: "Pizza",
        dietary: ['vegetarian'],
        popular: true
      },
      {
        id: "pizza2",
        name: "Pepperoni",
        price: 21.99,
        description: "Classic pepperoni with mozzarella cheese",
        category: "Pizza",
        popular: true
      },
      {
        id: "pizza3",
        name: "Meat Lovers",
        price: 24.99,
        description: "Pepperoni, sausage, ham, and bacon",
        category: "Pizza"
      },
      {
        id: "pizza4",
        name: "Veggie Supreme",
        price: 22.99,
        description: "Bell peppers, mushrooms, onions, olives, tomatoes",
        category: "Pizza",
        dietary: ['vegetarian']
      }
    ]
  },
  {
    name: "Main Courses",
    items: [
      {
        id: "main1",
        name: "Chicken Parmigiana",
        price: 19.99,
        description: "Breaded chicken breast with marinara and mozzarella",
        category: "Main Courses"
      },
      {
        id: "main2",
        name: "Spaghetti Carbonara",
        price: 16.99,
        description: "Creamy pasta with pancetta, eggs, and parmesan",
        category: "Main Courses"
      },
      {
        id: "main3",
        name: "Grilled Salmon",
        price: 24.99,
        description: "Fresh Atlantic salmon with lemon herb butter",
        category: "Main Courses",
        dietary: ['gluten-free']
      }
    ]
  },
  {
    name: "Desserts",
    items: [
      {
        id: "dessert1",
        name: "Tiramisu",
        price: 7.99,
        description: "Classic Italian dessert with coffee and mascarpone",
        category: "Desserts",
        dietary: ['vegetarian']
      },
      {
        id: "dessert2",
        name: "Chocolate Lava Cake",
        price: 8.99,
        description: "Warm chocolate cake with molten center and vanilla ice cream",
        category: "Desserts",
        dietary: ['vegetarian']
      }
    ]
  },
  {
    name: "Beverages",
    items: [
      {
        id: "bev1",
        name: "Coca-Cola",
        price: 3.99,
        description: "Classic Coke, Sprite, or Fanta",
        category: "Beverages"
      },
      {
        id: "bev2",
        name: "Italian Soda",
        price: 4.99,
        description: "Sparkling water with fruit syrup",
        category: "Beverages"
      },
      {
        id: "bev3",
        name: "House Wine",
        price: 8.99,
        description: "Red or white wine by the glass",
        category: "Beverages"
      }
    ]
  }
];

// Default configuration for template
export const defaultConfig: RestaurantConfig = {
  restaurant: defaultRestaurant,
  menuCategories: defaultMenuCategories,
  taxRate: 0.085,
  currency: 'USD',
  estimatedTimePerItem: 8,
  minimumOrderTime: 15
};

// Legacy exports for backward compatibility
export const restaurant = defaultRestaurant;
export const menuCategories = defaultMenuCategories;
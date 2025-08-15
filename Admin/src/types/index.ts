export interface Restaurant {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  customDomain?: string;
  generatedSites: GeneratedSite[];
  totalOrders: number;
  activeMenus: number;
}

export interface GeneratedSite {
  id: string;
  name: string;
  customerUrl: string;
  kitchenUrl: string;
  createdDate: string;
  status: 'active' | 'inactive' | 'processing';
  thumbnail?: string;
}

export interface MenuItem {
  id: string;
  category: string;
  name: string;
  price: string;
  description: string;
  image?: string;
}

export interface MenuData {
  restaurantName: string;
  categories: string[];
  menuItems: MenuItem[];
  brandColors: {
    primary: string;
    secondary: string;
  };
}

export interface User {
  id: string;
  email: string;
  restaurant: Restaurant;
}
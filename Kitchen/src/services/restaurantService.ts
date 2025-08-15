const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export interface RestaurantConfig {
  restaurant: {
    name: string;
    phone: string;
    address: string;
    primaryColor: string;
    secondaryColor: string;
    description?: string;
    email?: string;
  };
  menuCategories: any[];
  taxRate?: number;
  currency?: string;
}

/**
 * Load restaurant configuration by slug
 */
export async function loadRestaurantConfig(slug: string): Promise<RestaurantConfig | null> {
  try {
    const response = await fetch(`${API_URL}/api/restaurants/${slug}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Restaurant not found: ${slug}`);
        return null;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const config = await response.json();
    return config;
  } catch (error) {
    console.error('Error loading restaurant config:', error);
    return null;
  }
}
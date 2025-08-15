/**
 * Configuration loader service for dynamic restaurant data
 * This service handles loading restaurant configuration from various sources
 */

import { RestaurantConfig } from '../types';

// Default fallback configuration
const DEFAULT_CONFIG: RestaurantConfig = {
  restaurant: {
    name: "Sample Restaurant",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street, Your City",
    primaryColor: "#e74c3c",
    secondaryColor: "#2c3e50",
    description: "Delicious food, great service"
  },
  menuCategories: [
    {
      name: "Sample Category",
      items: [
        {
          id: "sample1",
          name: "Sample Item",
          price: 12.99,
          description: "A delicious sample item",
          category: "Sample Category"
        }
      ]
    }
  ],
  taxRate: 0.085,
  currency: "USD",
  estimatedTimePerItem: 8,
  minimumOrderTime: 15
};

/**
 * Load restaurant configuration from various sources
 * Priority: URL slug > URL params > localStorage > environment > default
 */
export async function loadRestaurantConfig(): Promise<RestaurantConfig> {
  try {
    // 1. Check URL path for restaurant slug (e.g., /paucek-and-lage)
    const slugConfig = await loadFromSlug();
    if (slugConfig) return slugConfig;

    // 2. Check URL parameters for restaurant ID or config
    const urlConfig = await loadFromUrlParams();
    if (urlConfig) return urlConfig;

    // 3. Check localStorage for cached config
    const cachedConfig = loadFromLocalStorage();
    if (cachedConfig) return cachedConfig;

    // 4. Check environment variables
    const envConfig = loadFromEnvironment();
    if (envConfig) return envConfig;

    // 5. Return default configuration
    console.warn('Using default restaurant configuration. Please provide restaurant data.');
    return DEFAULT_CONFIG;

  } catch (error) {
    console.error('Error loading restaurant configuration:', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Load configuration from URL slug (e.g., /paucek-and-lage)
 */
async function loadFromSlug(): Promise<RestaurantConfig | null> {
  try {
    const path = window.location.pathname;
    const slug = path.split('/')[1]; // Get first path segment

    if (slug && slug !== '') {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/restaurants/${slug}`);
      
      if (response.ok) {
        const config = await response.json();
        saveToLocalStorage(config);
        return validateAndNormalizeConfig(config);
      } else if (response.status === 404) {
        console.warn(`Restaurant not found for slug: ${slug}`);
      }
    }
  } catch (error) {
    console.error('Error loading from slug:', error);
  }
  return null;
}

/**
 * Load configuration from URL parameters
 * Supports: ?restaurant_id=123 or ?config=base64encodedconfig
 */
async function loadFromUrlParams(): Promise<RestaurantConfig | null> {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Check for direct config parameter
  const configParam = urlParams.get('config');
  if (configParam) {
    try {
      const decodedConfig = JSON.parse(atob(configParam));
      return validateAndNormalizeConfig(decodedConfig);
    } catch (error) {
      console.error('Invalid config parameter:', error);
    }
  }

  // Check for restaurant ID parameter
  const restaurantId = urlParams.get('restaurant_id');
  if (restaurantId) {
    return await loadFromAPI(restaurantId);
  }

  return null;
}

/**
 * Load configuration from localStorage
 */
function loadFromLocalStorage(): RestaurantConfig | null {
  try {
    const cached = localStorage.getItem('restaurant_config');
    if (cached) {
      const config = JSON.parse(cached);
      // Check if cache is still valid (24 hours)
      const cacheTime = localStorage.getItem('restaurant_config_time');
      if (cacheTime && Date.now() - parseInt(cacheTime) < 24 * 60 * 60 * 1000) {
        return validateAndNormalizeConfig(config);
      }
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  return null;
}

/**
 * Save configuration to localStorage
 */
function saveToLocalStorage(config: RestaurantConfig): void {
  try {
    localStorage.setItem('restaurant_config', JSON.stringify(config));
    localStorage.setItem('restaurant_config_time', Date.now().toString());
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Load configuration from API endpoint
 */
async function loadFromAPI(restaurantSlug?: string): Promise<RestaurantConfig | null> {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    // Try multiple API endpoints
    const endpoints = [
      restaurantSlug ? `${apiUrl}/api/restaurants/${restaurantSlug}` : null,
      `/config.json`, // Fallback to static config
    ].filter(Boolean);

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          return validateAndNormalizeConfig(data);
        }
      } catch (error) {
        console.log(`Failed to load from ${endpoint}:`, error);
      }
    }
  } catch (error) {
    console.error('API loading error:', error);
  }
  return null;
}

/**
 * Load configuration from environment variables
 */
function loadFromEnvironment(): RestaurantConfig | null {
  try {
    const envConfig = import.meta.env.VITE_RESTAURANT_CONFIG;
    if (envConfig) {
      return validateAndNormalizeConfig(JSON.parse(envConfig));
    }
  } catch (error) {
    console.error('Error loading from environment:', error);
  }
  return null;
}

/**
 * Validate and normalize configuration data
 */
function validateAndNormalizeConfig(config: any): RestaurantConfig {
  // Merge with defaults to ensure all required fields exist
  const normalizedConfig: RestaurantConfig = {
    restaurant: {
      name: config.restaurant?.name || DEFAULT_CONFIG.restaurant.name,
      phone: config.restaurant?.phone || DEFAULT_CONFIG.restaurant.phone,
      address: config.restaurant?.address || DEFAULT_CONFIG.restaurant.address,
      primaryColor: config.restaurant?.primaryColor || DEFAULT_CONFIG.restaurant.primaryColor,
      secondaryColor: config.restaurant?.secondaryColor || DEFAULT_CONFIG.restaurant.secondaryColor,
      logo: config.restaurant?.logo,
      description: config.restaurant?.description,
      hours: config.restaurant?.hours,
      email: config.restaurant?.email,
      website: config.restaurant?.website
    },
    menuCategories: config.menuCategories || DEFAULT_CONFIG.menuCategories,
    taxRate: config.taxRate || DEFAULT_CONFIG.taxRate,
    currency: config.currency || DEFAULT_CONFIG.currency,
    estimatedTimePerItem: config.estimatedTimePerItem || DEFAULT_CONFIG.estimatedTimePerItem,
    minimumOrderTime: config.minimumOrderTime || DEFAULT_CONFIG.minimumOrderTime
  };

  // Validate menu items have required fields
  normalizedConfig.menuCategories = normalizedConfig.menuCategories.map(category => ({
    ...category,
    items: category.items.map(item => ({
      id: item.id || `item_${Math.random().toString(36).substr(2, 9)}`,
      name: item.name || 'Unnamed Item',
      price: typeof item.price === 'number' ? item.price : 0,
      description: item.description || '',
      category: item.category || category.name,
      image: item.image,
      dietary: item.dietary || [],
      popular: item.popular || false
    }))
  }));

  return normalizedConfig;
}

/**
 * Update restaurant configuration dynamically
 */
export function updateRestaurantConfig(newConfig: Partial<RestaurantConfig>): void {
  // This would trigger a re-render with new configuration
  window.dispatchEvent(new CustomEvent('restaurant-config-update', { 
    detail: newConfig 
  }));
}

/**
 * Generate shareable URL with restaurant configuration
 */
export function generateShareableUrl(config: RestaurantConfig): string {
  const encodedConfig = btoa(JSON.stringify(config));
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?config=${encodedConfig}`;
}
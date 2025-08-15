const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export interface CreateRestaurantRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  description?: string;
  domain?: string;
}

export interface RestaurantResponse {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  address?: string;
  description?: string;
  domain?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMenuRequest {
  name: string;
  categories: {
    name: string;
    items: {
      id: string;
      name: string;
      price: number;
      description: string;
      category: string;
      image?: string;
      dietary?: string[];
      popular?: boolean;
    }[];
  }[];
}

/**
 * Create a new restaurant in the backend
 */
export async function createRestaurant(data: CreateRestaurantRequest): Promise<{
  restaurant: RestaurantResponse;
  credentials: {
    username: string;
    password: string;
    kitchenUrl: string;
    orderingUrl: string;
  };
}> {
  try {
    const response = await fetch(`${API_URL}/api/restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating restaurant:', error);
    throw error instanceof Error ? error : new Error('Failed to create restaurant');
  }
}

/**
 * Save processed menu data for a restaurant
 */
export async function saveMenu(restaurantId: string, menuData: CreateMenuRequest): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/menus/${restaurantId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(menuData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error saving menu:', error);
    throw error instanceof Error ? error : new Error('Failed to save menu');
  }
}

/**
 * Convert Gemini extracted data to backend format
 */
export function convertGeminiDataToBackend(extractedData: any) {
  return {
    name: extractedData.restaurantName || 'Extracted Menu',
    categories: extractedData.categories?.map((categoryName: string) => ({
      name: categoryName,
      items: extractedData.menuItems
        ?.filter((item: any) => item.category === categoryName)
        ?.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.price.replace('$', '')) || 0,
          description: item.description || '',
          category: item.category,
          dietary: [],
          popular: false
        })) || []
    })) || []
  };
}

// No deployment functionality - restaurant creation only

/**
 * Complete restaurant setup workflow
 */
export async function setupRestaurantFromGemini(
  restaurantInfo: CreateRestaurantRequest,
  extractedMenuData: any
): Promise<{
  restaurant: RestaurantResponse;
  credentials: {
    username: string;
    password: string;
    kitchenUrl: string;
    orderingUrl: string;
  };
}> {
  try {
    // 1. Create restaurant
    const restaurantResult = await createRestaurant({
      ...restaurantInfo,
    });

    // 2. Save menu data
    const menuData = convertGeminiDataToBackend(extractedMenuData);
    await saveMenu(restaurantResult.restaurant.id, menuData);

    return restaurantResult;
  } catch (error) {
    console.error('Error setting up restaurant:', error);
    throw error instanceof Error ? error : new Error('Failed to setup restaurant');
  }
}
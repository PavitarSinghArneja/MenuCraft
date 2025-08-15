import { ExtractedMenuData } from './menuExtraction';

export interface OrderingWebsiteConfig {
  restaurant: {
    name: string;
    phone: string;
    address: string;
    primaryColor: string;
    secondaryColor: string;
    description: string;
    hours: string;
    email: string;
  };
  menuCategories: Array<{
    name: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      description: string;
      category: string;
      dietary?: string[];
      popular?: boolean;
    }>;
  }>;
  taxRate: number;
  currency: string;
  estimatedTimePerItem: number;
  minimumOrderTime: number;
}

export class MenuExportService {
  static convertToOrderingConfig(
    extractedData: ExtractedMenuData,
    restaurantInfo?: {
      phone?: string;
      address?: string;
      description?: string;
      hours?: string;
      email?: string;
    }
  ): OrderingWebsiteConfig {
    // Convert price strings to numbers
    const parsePrice = (priceStr: string): number => {
      const cleaned = priceStr.replace(/[$,]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Group menu items by category
    const menuCategories = extractedData.categories.map(categoryName => {
      const categoryItems = extractedData.menuItems
        .filter(item => item.category === categoryName)
        .map(item => ({
          id: item.id,
          name: item.name,
          price: parsePrice(item.price),
          description: item.description || `Delicious ${item.name.toLowerCase()}`,
          category: item.category,
          // Add dietary info based on item name/description analysis
          dietary: MenuExportService.inferDietaryInfo(item.name, item.description),
          // Mark items as popular based on common popular items
          popular: MenuExportService.isPopularItem(item.name)
        }));

      return {
        name: categoryName,
        items: categoryItems
      };
    }).filter(category => category.items.length > 0);

    return {
      restaurant: {
        name: extractedData.restaurantName,
        phone: restaurantInfo?.phone || '+1 (555) 123-4567',
        address: restaurantInfo?.address || '123 Main Street, City, State 12345',
        primaryColor: extractedData.brandColors.primary,
        secondaryColor: extractedData.brandColors.secondary,
        description: restaurantInfo?.description || `Experience the finest dining at ${extractedData.restaurantName} with our carefully crafted menu`,
        hours: restaurantInfo?.hours || 'Mon-Sun: 11:00 AM - 10:00 PM',
        email: restaurantInfo?.email || 'info@restaurant.com'
      },
      menuCategories,
      taxRate: 0.08,
      currency: 'USD',
      estimatedTimePerItem: 10,
      minimumOrderTime: 20
    };
  }

  private static inferDietaryInfo(name: string, description: string): string[] {
    const dietary: string[] = [];
    const text = `${name} ${description}`.toLowerCase();
    
    if (text.includes('vegetarian') || text.includes('veggie') || 
        text.includes('salad') || text.includes('cheese') ||
        text.includes('pasta') && !text.includes('meat')) {
      dietary.push('vegetarian');
    }
    
    if (text.includes('vegan') || text.includes('plant-based')) {
      dietary.push('vegan');
    }
    
    if (text.includes('gluten-free') || text.includes('gf')) {
      dietary.push('gluten-free');
    }
    
    if (text.includes('spicy') || text.includes('hot')) {
      dietary.push('spicy');
    }
    
    return dietary;
  }

  private static isPopularItem(name: string): boolean {
    const popularKeywords = [
      'burger', 'pizza', 'chicken', 'steak', 'salmon', 'pasta',
      'special', 'signature', 'famous', 'classic', 'favorite'
    ];
    
    const nameLower = name.toLowerCase();
    return popularKeywords.some(keyword => nameLower.includes(keyword));
  }

  static downloadAsJSON(config: OrderingWebsiteConfig, filename: string = 'menu-config.json'): void {
    const jsonString = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  static copyToClipboard(config: OrderingWebsiteConfig): Promise<void> {
    const jsonString = JSON.stringify(config, null, 2);
    return navigator.clipboard.writeText(jsonString);
  }
}
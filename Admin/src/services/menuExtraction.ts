import { GEMINI_CONFIG } from '../config/gemini';
import { MenuItem } from '../types';

export interface ExtractedMenuData {
  restaurantName: string;
  categories: string[];
  menuItems: MenuItem[];
  brandColors: {
    primary: string;
    secondary: string;
  };
}

export class MenuExtractionService {
  private async convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private async callGeminiAPI(imageData: string, mimeType: string): Promise<any> {
    const prompt = `
You are a menu extraction AI. Analyze this restaurant menu image and extract the following information in JSON format:

{
  "restaurantName": "Name of the restaurant (if visible, otherwise use 'Restaurant')",
  "categories": ["Array of menu categories like 'Appetizers', 'Main Courses', 'Beverages', etc."],
  "menuItems": [
    {
      "id": "unique_id",
      "category": "category_name",
      "name": "item_name",
      "price": "$X.XX",
      "description": "item_description"
    }
  ],
  "brandColors": {
    "primary": "#hexcolor (dominant color from menu design)",
    "secondary": "#hexcolor (secondary color from menu design)"
  }
}

Instructions:
- Extract ALL visible menu items with their prices
- Group items by their categories
- Include descriptions if available
- If prices are missing, use "$0.00"
- Generate realistic IDs for each item
- Infer brand colors from the menu design
- Be thorough and accurate
- Return only valid JSON, no additional text
`;

    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: imageData
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
      }
    };

    const response = await fetch(
      `${GEMINI_CONFIG.apiUrl}/${GEMINI_CONFIG.model}:generateContent?key=${GEMINI_CONFIG.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  private parseGeminiResponse(response: any): ExtractedMenuData {
    try {
      const content = response.candidates[0].content.parts[0].text;
      
      // Clean up the response to extract JSON
      let jsonStr = content.trim();
      
      // Remove markdown code blocks if present
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      const parsed = JSON.parse(jsonStr);
      
      // Validate and ensure required fields
      return {
        restaurantName: parsed.restaurantName || 'Restaurant',
        categories: Array.isArray(parsed.categories) ? parsed.categories : ['Menu Items'],
        menuItems: Array.isArray(parsed.menuItems) ? parsed.menuItems.map((item: any, index: number) => ({
          id: item.id || `item_${index + 1}`,
          category: item.category || 'Menu Items',
          name: item.name || 'Menu Item',
          price: item.price || '$0.00',
          description: item.description || ''
        })) : [],
        brandColors: {
          primary: parsed.brandColors?.primary || '#3B82F6',
          secondary: parsed.brandColors?.secondary || '#1E293B'
        }
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      throw new Error('Failed to parse menu extraction results');
    }
  }

  async extractMenuFromFiles(files: File[]): Promise<ExtractedMenuData> {
    if (files.length === 0) {
      throw new Error('No files provided for extraction');
    }

    // For now, process the first image file
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (!imageFile) {
      throw new Error('No image files found. Please upload menu images for extraction.');
    }

    try {
      // Convert file to base64
      const base64Data = await this.convertFileToBase64(imageFile);
      
      // Call Gemini API
      const response = await this.callGeminiAPI(base64Data, imageFile.type);
      
      // Parse and return results
      return this.parseGeminiResponse(response);
      
    } catch (error) {
      console.error('Menu extraction error:', error);
      throw new Error(`Failed to extract menu: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const menuExtractionService = new MenuExtractionService();
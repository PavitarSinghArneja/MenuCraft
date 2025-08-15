/**
 * Template generation utilities for creating restaurant-specific builds
 * This module helps generate customized versions of the ordering system
 */

import { RestaurantConfig } from '../types';

/**
 * Generate CSS custom properties from restaurant configuration
 */
export function generateCSSVariables(config: RestaurantConfig): string {
  return `
:root {
  --primary-color: ${config.restaurant.primaryColor};
  --secondary-color: ${config.restaurant.secondaryColor};
  --restaurant-name: "${config.restaurant.name}";
  --tax-rate: ${config.taxRate || 0.085};
  --currency: "${config.currency || 'USD'}";
}
  `.trim();
}

/**
 * Generate meta tags for restaurant-specific SEO
 */
export function generateMetaTags(config: RestaurantConfig): string {
  const { restaurant } = config;
  
  return `
<title>${restaurant.name} - Online Ordering</title>
<meta name="description" content="${restaurant.description || `Order delicious food from ${restaurant.name}. ${restaurant.address}`}" />
<meta name="keywords" content="restaurant, food delivery, ${restaurant.name}, online ordering" />
<meta property="og:title" content="${restaurant.name} - Online Ordering" />
<meta property="og:description" content="${restaurant.description || `Order delicious food from ${restaurant.name}`}" />
<meta property="og:type" content="website" />
${restaurant.logo ? `<meta property="og:image" content="${restaurant.logo}" />` : ''}
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${restaurant.name} - Online Ordering" />
<meta name="twitter:description" content="${restaurant.description || `Order delicious food from ${restaurant.name}`}" />
  `.trim();
}

/**
 * Generate environment variables for build-time configuration
 */
export function generateEnvVariables(config: RestaurantConfig): Record<string, string> {
  return {
    VITE_RESTAURANT_NAME: config.restaurant.name,
    VITE_RESTAURANT_PHONE: config.restaurant.phone,
    VITE_RESTAURANT_ADDRESS: config.restaurant.address,
    VITE_PRIMARY_COLOR: config.restaurant.primaryColor,
    VITE_SECONDARY_COLOR: config.restaurant.secondaryColor,
    VITE_TAX_RATE: (config.taxRate || 0.085).toString(),
    VITE_CURRENCY: config.currency || 'USD',
    VITE_RESTAURANT_CONFIG: JSON.stringify(config)
  };
}

/**
 * Generate a complete HTML template with restaurant-specific configuration
 */
export function generateHTMLTemplate(config: RestaurantConfig): string {
  const cssVariables = generateCSSVariables(config);
  const metaTags = generateMetaTags(config);
  
  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="${config.restaurant.logo || '/vite.svg'}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${metaTags}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      ${cssVariables}
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
    <script>
      // Inject restaurant configuration
      window.__RESTAURANT_CONFIG__ = ${JSON.stringify(config)};
    </script>
  </body>
</html>
  `.trim();
}

/**
 * Generate a deployment-ready configuration file
 */
export function generateDeploymentConfig(config: RestaurantConfig): {
  configJson: string;
  envFile: string;
  htmlTemplate: string;
} {
  return {
    configJson: JSON.stringify(config, null, 2),
    envFile: Object.entries(generateEnvVariables(config))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n'),
    htmlTemplate: generateHTMLTemplate(config)
  };
}

/**
 * Validate restaurant configuration for deployment
 */
export function validateConfigForDeployment(config: RestaurantConfig): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!config.restaurant.name?.trim()) {
    errors.push('Restaurant name is required');
  }
  
  if (!config.restaurant.phone?.trim()) {
    errors.push('Restaurant phone number is required');
  }
  
  if (!config.restaurant.address?.trim()) {
    errors.push('Restaurant address is required');
  }

  if (!config.menuCategories || config.menuCategories.length === 0) {
    errors.push('At least one menu category is required');
  }

  // Menu validation
  config.menuCategories?.forEach((category, categoryIndex) => {
    if (!category.name?.trim()) {
      errors.push(`Category ${categoryIndex + 1} is missing a name`);
    }
    
    if (!category.items || category.items.length === 0) {
      warnings.push(`Category "${category.name}" has no menu items`);
    }
    
    category.items?.forEach((item, itemIndex) => {
      if (!item.name?.trim()) {
        errors.push(`Item ${itemIndex + 1} in category "${category.name}" is missing a name`);
      }
      
      if (typeof item.price !== 'number' || item.price < 0) {
        errors.push(`Item "${item.name}" has an invalid price`);
      }
    });
  });

  // Color validation
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!colorRegex.test(config.restaurant.primaryColor)) {
    errors.push('Primary color must be a valid hex color (e.g., #e74c3c)');
  }
  
  if (!colorRegex.test(config.restaurant.secondaryColor)) {
    errors.push('Secondary color must be a valid hex color (e.g., #2c3e50)');
  }

  // Optional field warnings
  if (!config.restaurant.description) {
    warnings.push('Restaurant description is recommended for SEO');
  }
  
  if (!config.restaurant.logo) {
    warnings.push('Restaurant logo is recommended for branding');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
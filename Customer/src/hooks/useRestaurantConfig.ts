import { useState, useEffect } from 'react';
import { RestaurantConfig } from '../types';
import { loadRestaurantConfig } from '../services/configLoader';

/**
 * Hook for managing restaurant configuration
 * Handles loading, caching, and updating restaurant data
 */
export function useRestaurantConfig() {
  const [config, setConfig] = useState<RestaurantConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();

    // Listen for configuration updates
    const handleConfigUpdate = (event: CustomEvent) => {
      if (event.detail) {
        setConfig(prevConfig => ({
          ...prevConfig!,
          ...event.detail
        }));
      }
    };

    window.addEventListener('restaurant-config-update', handleConfigUpdate as EventListener);

    return () => {
      window.removeEventListener('restaurant-config-update', handleConfigUpdate as EventListener);
    };
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedConfig = await loadRestaurantConfig();
      setConfig(loadedConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load restaurant configuration');
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (updates: Partial<RestaurantConfig>) => {
    if (config) {
      const updatedConfig = { ...config, ...updates };
      setConfig(updatedConfig);
      
      // Save to localStorage for persistence
      try {
        localStorage.setItem('restaurant_config', JSON.stringify(updatedConfig));
        localStorage.setItem('restaurant_config_time', Date.now().toString());
      } catch (error) {
        console.error('Failed to save config to localStorage:', error);
      }
    }
  };

  const reloadConfig = () => {
    // Clear cache and reload
    localStorage.removeItem('restaurant_config');
    localStorage.removeItem('restaurant_config_time');
    loadConfig();
  };

  return {
    config,
    loading,
    error,
    updateConfig,
    reloadConfig
  };
}
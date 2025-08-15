import React, { useState, useEffect } from 'react';
import { Clock, Settings, LogOut, Volume2, VolumeX } from 'lucide-react';
import { getRestaurantSlugFromUrl } from '../services/orderService';
import { loadRestaurantConfig } from '../services/restaurantService';

interface HeaderProps {
  currentTime: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentTime, 
  soundEnabled, 
  onToggleSound, 
  onLogout 
}) => {
  const [restaurant, setRestaurant] = useState<any>(null);

  // Load restaurant configuration
  useEffect(() => {
    const loadConfig = async () => {
      const slug = getRestaurantSlugFromUrl();
      if (slug) {
        const config = await loadRestaurantConfig(slug);
        if (config) {
          setRestaurant(config.restaurant);
        }
      }
    };
    
    loadConfig();
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">{restaurant?.name || 'Restaurant Kitchen'}</h1>
            <p className="text-gray-600 text-sm">{restaurant?.address || ''}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className="font-mono text-lg text-gray-800">{currentTime}</span>
          </div>
          
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-lg transition-colors ${
              soundEnabled 
                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={soundEnabled ? 'Sound ON' : 'Sound OFF'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          
          <button
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <button
            onClick={onLogout}
            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
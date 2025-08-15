import React from 'react';
import { ShoppingCart, Phone, MapPin } from 'lucide-react';
import { Restaurant } from '../types';

interface HeaderProps {
  restaurant: Restaurant;
  cartItemCount: number;
  onCartClick: () => void;
}

export default function Header({ restaurant, cartItemCount, onCartClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b border-primary">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-black">
              {restaurant.name}
            </h1>
            <div className="hidden sm:flex items-center gap-4 text-sm text-black mt-1">
              <div className="flex items-center gap-1">
                <Phone size={14} />
                <span>{restaurant.phone}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{restaurant.address}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onCartClick}
            className="relative flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <ShoppingCart size={20} />
            <span className="hidden sm:inline">Cart</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-black text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
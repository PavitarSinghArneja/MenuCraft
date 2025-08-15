import React from 'react';
import { Plus, Leaf, Wheat } from 'lucide-react';
import { MenuItem as MenuItemType } from '../types';
import { formatCurrency } from '../utils/calculations';

interface MenuItemProps {
  item: MenuItemType;
  onAddToCart: (item: MenuItemType) => void;
}

export default function MenuItem({ item, onAddToCart }: MenuItemProps) {
  return (
    <div className="bg-white rounded-md border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-2 mb-1">
            <h3 className="font-semibold text-black leading-tight">{item.name}</h3>
            {item.popular && (
              <span className="bg-accent text-black text-xs px-2 py-0.5 rounded-full font-medium shrink-0">
                Popular
              </span>
            )}
          </div>
          
          <p className="text-sm text-black mb-2 leading-relaxed">{item.description}</p>
          
          <div className="flex items-center gap-3 text-xs">
            {item.dietary?.includes('vegetarian') && (
              <div className="flex items-center gap-1 text-black" title="Vegetarian">
                <Leaf size={12} />
                <span className="font-medium">Vegetarian</span>
              </div>
            )}
            {item.dietary?.includes('gluten-free') && (
              <div className="flex items-center gap-1 text-black" title="Gluten Free">
                <Wheat size={12} />
                <span className="font-medium">Gluten Free</span>
              </div>
            )}
            {item.dietary?.includes('spicy') && (
              <div className="flex items-center gap-1 text-black" title="Spicy">
                <span>🌶️</span>
                <span className="font-medium">Spicy</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-lg font-bold text-black">
            {formatCurrency(item.price)}
          </span>
          
          <button
            onClick={() => onAddToCart(item)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium bg-primary text-white hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
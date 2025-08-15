import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { MenuCategory, MenuItem as MenuItemType } from '../types';
import MenuItem from './MenuItem';

interface MenuSectionProps {
  categories: MenuCategory[];
  onAddToCart: (item: MenuItemType) => void;
}

export default function MenuSection({ categories, onAddToCart }: MenuSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Pizza', 'Appetizers']));

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={20} />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            style={{ '--tw-ring-color': 'var(--primary-color)' } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Menu Categories */}
      <div className="space-y-6">
        {filteredCategories.map(category => (
          <div key={category.name} className="bg-background-light rounded-lg overflow-hidden border border-accent">
            <button
              onClick={() => toggleCategory(category.name)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-light-accent transition-colors"
            >
              <h2 className="text-xl font-bold text-black">{category.name}</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-black bg-white px-2 py-1 rounded-full border border-accent">
                  {category.items.length} items
                </span>
                {expandedCategories.has(category.name) ? (
                  <ChevronUp className="text-black" size={20} />
                ) : (
                  <ChevronDown className="text-black" size={20} />
                )}
              </div>
            </button>
            
            {expandedCategories.has(category.name) && (
              <div className="p-4 pt-0">
                <div className="space-y-2">
                  {category.items.map(item => (
                    <MenuItem
                      key={item.id}
                      item={item}
                      onAddToCart={onAddToCart}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <p className="text-black text-lg">No items found matching "{searchTerm}"</p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-2 text-black hover:underline"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
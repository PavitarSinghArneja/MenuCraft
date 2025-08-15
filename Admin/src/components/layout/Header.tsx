import React from 'react';
import { Bell, Search, LogOut, User } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onLogout }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && (
            <p className="text-slate-600 mt-1">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </Button>
          
          <div className="flex items-center space-x-2 border-l border-slate-200 pl-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-slate-500" />
              <span className="text-sm text-slate-700 font-medium">Admin</span>
            </div>
            
            {onLogout && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="ml-2">Logout</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
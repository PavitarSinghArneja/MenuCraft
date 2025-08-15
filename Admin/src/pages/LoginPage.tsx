import React, { useState } from 'react';
import { Globe, ChefHat, Smartphone, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SupabaseService, AdminUser } from '../services/supabaseService';

interface LoginPageProps {
  onLogin: (user: AdminUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@restaurant.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { user } = await SupabaseService.signIn(email, password);
      if (user) {
        onLogin(user as AdminUser);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <div className="flex min-h-screen">
        {/* Left side - Hero/Features */}
        <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10 flex flex-col justify-center px-12">
            <div className="max-w-md">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">RestaurantOS</h1>
              </div>
              
              <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                Generate Your Custom Ordering Website in Minutes
              </h2>
              
              <p className="text-xl text-blue-100 mb-12">
                Transform your restaurant menu into a professional ordering platform with our AI-powered website generator.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ChefHat className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Smart Menu Processing</h3>
                    <p className="text-blue-100">Upload your menu and watch our AI extract items, prices, and categories automatically.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Mobile-First Design</h3>
                    <p className="text-blue-100">Beautiful, responsive ordering sites that work perfectly on any device.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Instant Deployment</h3>
                    <p className="text-blue-100">Get your ordering site live in minutes with custom domains and kitchen dashboards.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-white bg-opacity-10 rounded-full"></div>
          <div className="absolute bottom-32 right-32 w-20 h-20 bg-white bg-opacity-10 rounded-full"></div>
        </div>
        
        {/* Right side - Login form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <div className="lg:hidden flex items-center justify-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">RestaurantOS</h1>
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
              <p className="text-slate-600">Sign in to manage your restaurant websites</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
              
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-slate-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700">Forgot password?</a>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-slate-600">
                  New to RestaurantOS?{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                    Start your free trial
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
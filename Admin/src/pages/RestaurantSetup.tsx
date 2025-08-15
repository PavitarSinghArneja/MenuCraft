import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, ExternalLink, Copy, User, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { ExtractedMenuData } from '../services/menuExtraction';
import { setupRestaurantFromGemini } from '../services/restaurantService';
import { AdminUser } from '../services/supabaseService';
import { StorageService } from '../services/storageService';

interface RestaurantSetupProps {
  extractedData: ExtractedMenuData;
  onBack: () => void;
  onComplete: () => void;
  currentUser: AdminUser;
}

export function RestaurantSetup({ extractedData, onBack, onComplete, currentUser }: RestaurantSetupProps) {
  const [formData, setFormData] = useState({
    name: extractedData.restaurantName || '',
    email: '',
    phone: '',
    address: '',
    description: 'Delicious food with excellent service'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [setupResult, setSetupResult] = useState<{
    restaurant: {
      id: string;
      name: string;
      slug: string;
      email: string;
    };
    credentials: {
      username: string;
      password: string;
      kitchenUrl: string;
      orderingUrl: string;
    };
  } | null>(null);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const result = await setupRestaurantFromGemini(formData, extractedData);
      setSetupResult(result);
      
      // Store the generated website in Supabase
      const websiteData = {
        user_id: currentUser.id,
        name: result.restaurant.name,
        slug: result.restaurant.slug,
        customer_url: result.credentials.orderingUrl,
        kitchen_url: result.credentials.kitchenUrl,
        is_active: true,
        menu_items: extractedData.menuItems.length,
        total_orders: 0
      };
      
      // Save to Supabase with optimized caching
      await StorageService.saveWebsite(websiteData);
      
    } catch (err) {
      console.error('Setup failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to setup restaurant');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (setupResult) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Restaurant Setup Complete!</h1>
          <p className="text-slate-600">Your restaurant websites are now live and ready for orders</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Restaurant Info */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Restaurant Details</h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-slate-700">Name:</span>
                <span className="ml-2 text-slate-600">{setupResult.restaurant.name}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Slug:</span>
                <span className="ml-2 text-slate-600 font-mono">{setupResult.restaurant.slug}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Email:</span>
                <span className="ml-2 text-slate-600">{setupResult.restaurant.email}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Menu Items:</span>
                <span className="ml-2 text-slate-600">{extractedData.menuItems.length} items</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Categories:</span>
                <span className="ml-2 text-slate-600">{extractedData.categories.join(', ')}</span>
              </div>
            </div>
          </Card>

          {/* Access Credentials */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Kitchen Access</h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-slate-700">Username:</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-slate-600 font-mono bg-gray-100 px-2 py-1 rounded">
                    {setupResult.credentials.username}
                  </span>
                  <button
                    onClick={() => copyToClipboard(setupResult.credentials.username)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
              <div>
                <span className="font-medium text-slate-700">Password:</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-slate-600 font-mono bg-gray-100 px-2 py-1 rounded">
                    {setupResult.credentials.password}
                  </span>
                  <button
                    onClick={() => copyToClipboard(setupResult.credentials.password)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                ⚠️ Save these credentials! Change the password after first login.
              </p>
            </div>
          </Card>
        </div>

        {/* Website URLs */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Customer Ordering Site</h3>
            <p className="text-slate-600 mb-4">Where customers place orders</p>
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <code className="text-sm text-slate-700">{setupResult.credentials.orderingUrl}</code>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => window.open(setupResult.credentials.orderingUrl, '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink size={16} />
                Visit Site
              </Button>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(setupResult.credentials.orderingUrl)}
              >
                <Copy size={16} />
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Kitchen Dashboard</h3>
            <p className="text-slate-600 mb-4">Manage incoming orders</p>
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <code className="text-sm text-slate-700">{setupResult.credentials.kitchenUrl}</code>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => window.open(setupResult.credentials.kitchenUrl, '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink size={16} />
                Open Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(setupResult.credentials.kitchenUrl)}
              >
                <Copy size={16} />
              </Button>
            </div>
          </Card>
        </div>

        <div className="text-center">
          <Button onClick={onComplete} className="px-8">
            Continue to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          disabled={isSubmitting}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Complete Restaurant Setup</h1>
      </div>

      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Menu Processing Complete</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-slate-700">Restaurant:</span>
            <p className="text-slate-600">{extractedData.restaurantName}</p>
          </div>
          <div>
            <span className="font-medium text-slate-700">Menu Items:</span>
            <p className="text-slate-600">{extractedData.menuItems.length} items</p>
          </div>
          <div>
            <span className="font-medium text-slate-700">Categories:</span>
            <p className="text-slate-600">{extractedData.categories.join(', ')}</p>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Restaurant Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <User size={16} className="inline mr-1" />
                Restaurant Name
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Your Restaurant Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Mail size={16} className="inline mr-1" />
                Email Address
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contact@restaurant.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Phone size={16} className="inline mr-1" />
                Phone Number
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <MapPin size={16} className="inline mr-1" />
                Address
              </label>
              <Input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Main Street, City, State"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of your restaurant"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
          </div>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="font-medium">Setup Failed</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Setting up restaurant...
              </span>
            ) : (
              'Create Restaurant & Generate Websites'
            )}
          </Button>
        </div>

        <div className="text-sm text-slate-600 bg-blue-50 p-4 rounded-lg">
          <p className="font-medium mb-2">What happens next:</p>
          <ul className="space-y-1 text-sm">
            <li>• Restaurant profile created in database</li>
            <li>• Menu data saved and categorized</li>
            <li>• Customer ordering website generated</li>
            <li>• Kitchen dashboard created</li>
            <li>• Admin credentials provided</li>
          </ul>
        </div>
      </form>
    </div>
  );
}
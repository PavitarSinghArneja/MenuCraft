import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  ShoppingCart, 
  Menu, 
  Plus, 
  ExternalLink, 
  Eye,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { GeneratedWebsite, AdminUser } from '../services/supabaseService';
import { StorageService } from '../services/storageService';

interface DashboardProps {
  onNavigate: (page: string) => void;
  currentUser: AdminUser;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, currentUser }) => {
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [websites, setWebsites] = useState<GeneratedWebsite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [currentUser.id]);

  const loadDashboardData = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setRefreshing(true);
      
      // Use optimized storage service with smart caching
      const websites = await StorageService.getWebsites(currentUser.id, forceRefresh);
      setWebsites(websites);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Auto-refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardData(true); // Force refresh every 5 minutes
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [currentUser.id]);

  // Calculate real stats from stored websites
  const totalOrders = websites.reduce((sum, site) => sum + (site.total_orders || 0), 0);
  const totalMenuItems = websites.reduce((sum, site) => sum + (site.menu_items || 0), 0);
  const activeWebsites = websites.filter(site => site.is_active).length;
  
  const stats = [
    {
      title: 'Generated Sites',
      value: websites.length,
      icon: Globe,
      color: 'bg-blue-500',
      change: websites.length === 0 ? 'No sites generated yet' : 
              websites.length === 1 ? '1 site created' : 
              `${websites.length} sites created`
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-500',
      change: totalOrders === 0 ? 'No orders yet' : 
              totalOrders === 1 ? '1 order received' : 
              `${totalOrders} orders received`
    },
    {
      title: 'Active Menus',
      value: totalMenuItems,
      icon: Menu,
      color: 'bg-purple-500',
      change: totalMenuItems === 0 ? 'No menu items yet' : 
              `${totalMenuItems} menu items across all sites`
    },
    {
      title: 'Active Sites',
      value: activeWebsites,
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: activeWebsites === 0 ? 'No active sites' : 
              activeWebsites === 1 ? '1 site active' : 
              `${activeWebsites} sites active`
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome to MenuCraft!</h2>
            <p className="text-blue-100">Start by generating your first restaurant website.</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => loadDashboardData(true)}
              disabled={refreshing}
              className="bg-white bg-opacity-20 text-white hover:bg-opacity-30 border-0"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button 
              onClick={() => setShowGenerateModal(true)}
              className="bg-white text-black hover:bg-blue-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate New Website
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} hover>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generated Websites */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Generated Websites</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onNavigate('sites')}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ) : websites.length === 0 ? (
                <div className="text-center py-8">
                  <Globe className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">No websites generated yet</p>
                  <Button 
                    onClick={() => setShowGenerateModal(true)}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Your First Website
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {websites.slice(0, 3).map((site, index) => (
                    <div key={site.id || index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${site.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <div>
                          <h4 className="font-medium text-slate-900">{site.name}</h4>
                          <p className="text-sm text-slate-600">{site.menu_items} items • {site.total_orders} orders</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(site.customer_url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Visit
                        </Button>
                        <Button
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(site.kitchen_url, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Kitchen
                        </Button>
                      </div>
                    </div>
                  ))}
                  {websites.length > 3 && (
                    <div className="text-center pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onNavigate('sites')}
                      >
                        View {websites.length - 3} more sites
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No recent orders</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generate Website Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate New Website"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Ready to create a new ordering website? Let's start by uploading your menu.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Quick Steps:</h4>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>Upload your menu (PDF or images)</li>
              <li>Review extracted menu items</li>
              <li>Customize your restaurant branding</li>
              <li>Generate your website instantly</li>
            </ol>
          </div>
          <div className="flex space-x-3 pt-4">
            <Button 
              onClick={() => {
                setShowGenerateModal(false);
                onNavigate('upload');
              }}
              className="flex-1"
            >
              Start Menu Upload
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowGenerateModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
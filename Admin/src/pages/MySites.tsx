import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  ExternalLink, 
  Settings, 
  Trash2, 
  Plus, 
  Calendar,
  Users,
  ShoppingCart
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { GeneratedWebsite, AdminUser } from '../services/supabaseService';
import { StorageService } from '../services/storageService';

interface MySitesProps {
  onNavigate: (page: string) => void;
  currentUser: AdminUser;
}

export const MySites: React.FC<MySitesProps> = ({ onNavigate, currentUser }) => {
  const [websites, setWebsites] = useState<GeneratedWebsite[]>([]);
  const [selectedSite, setSelectedSite] = useState<GeneratedWebsite | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWebsites();
  }, []);

  const loadWebsites = async (forceRefresh = false) => {
    try {
      // Use optimized storage service with smart caching
      const userWebsites = await StorageService.getWebsites(currentUser.id, forceRefresh);
      setWebsites(userWebsites);
    } catch (error) {
      console.error('Error loading websites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSite = (site: GeneratedWebsite) => {
    setSelectedSite(site);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedSite) return;
    
    try {
      // Use optimized storage service for deletion
      await StorageService.deleteWebsite(selectedSite.id, currentUser.id);
      const updatedWebsites = websites.filter(site => site.id !== selectedSite.id);
      setWebsites(updatedWebsites);
    } catch (error) {
      console.error('Error deleting website:', error);
    }
    
    setShowDeleteModal(false);
    setSelectedSite(null);
  };

  const toggleSiteStatus = async (siteId: string) => {
    try {
      const site = websites.find(s => s.id === siteId);
      if (!site) return;
      
      // Use optimized storage service for status update
      await StorageService.updateWebsiteStatus(siteId, currentUser.id, !site.is_active);
      const updatedWebsites = websites.map(site => 
        site.id === siteId ? { ...site, is_active: !site.is_active } : site
      );
      setWebsites(updatedWebsites);
    } catch (error) {
      console.error('Error updating website status:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (websites.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No websites generated yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first restaurant website to get started with online ordering.
          </p>
          <Button onClick={() => onNavigate('upload')}>
            <Plus className="w-4 h-4 mr-2" />
            Generate Your First Website
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Generated Websites</h2>
          <p className="text-gray-600">Manage your restaurant ordering websites</p>
        </div>
        <Button onClick={() => onNavigate('upload')}>
          <Plus className="w-4 h-4 mr-2" />
          Generate New Website
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {websites.map((site) => (
          <Card key={site.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{site.name}</CardTitle>
                  <p className="text-sm text-gray-500 font-mono">{site.slug}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-3 h-3 rounded-full ${
                    site.is_active ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-xs text-gray-500">
                    {site.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center text-gray-500">
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Orders
                    </div>
                    <div className="font-semibold">{site.total_orders}</div>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      Menu Items
                    </div>
                    <div className="font-semibold">{site.menu_items}</div>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Created {formatDate(site.created_at)}
                  </div>
                  {site.last_order_at && (
                    <div className="flex items-center mt-1">
                      Last order {formatDate(site.last_order_at)}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => window.open(site.customer_url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Customer Site
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(site.kitchen_url, '_blank')}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Kitchen
                    </Button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => toggleSiteStatus(site.id)}
                    >
                      {site.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteSite(site)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Website"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{selectedSite?.name}</strong>? 
            This action cannot be undone and will permanently remove the website and all associated data.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-red-800 font-medium mb-2">This will permanently delete:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Customer ordering website</li>
              <li>• Kitchen dashboard access</li>
              <li>• All order history and data</li>
              <li>• Menu configurations</li>
            </ul>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Website
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
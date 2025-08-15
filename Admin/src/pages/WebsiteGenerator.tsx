import React, { useState } from 'react';
import { 
  Palette, 
  Globe, 
  Eye, 
  CheckCircle, 
  ExternalLink,
  Smartphone,
  Monitor,
  Download,
  Copy,
  FileText
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { mockMenuItems, menuCategories } from '../data/mockData';
import { Modal } from '../components/ui/Modal';
import { ExtractedMenuData } from '../services/menuExtraction';
import { MenuExportService, OrderingWebsiteConfig } from '../services/menuExport';

interface WebsiteGeneratorProps {
  onNavigate: (page: string, data?: ExtractedMenuData) => void;
  extractedData?: ExtractedMenuData;
  currentUser: any; // Will be used later for website limits
}

export const WebsiteGenerator: React.FC<WebsiteGeneratorProps> = ({ onNavigate, extractedData, currentUser }) => {
  const [restaurantName, setRestaurantName] = useState(extractedData?.restaurantName || "");
  const [primaryColor, setPrimaryColor] = useState(extractedData?.brandColors.primary || '#e74c3c');
  const [secondaryColor, setSecondaryColor] = useState(extractedData?.brandColors.secondary || '#2c3e50');
  const [customDomain, setCustomDomain] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [jsonConfig, setJsonConfig] = useState<OrderingWebsiteConfig | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Use extracted data if available, otherwise fall back to mock data
  const menuItems = extractedData?.menuItems || mockMenuItems;
  const categories = extractedData?.categories || menuCategories;

  const generatedUrls = {
    customer: `https://${customDomain}-orders.restaurantos.com`,
    kitchen: `https://${customDomain}-kitchen.restaurantos.com`
  };

  const handleExportJson = () => {
    if (!extractedData) return;
    
    const config = MenuExportService.convertToOrderingConfig(extractedData, {
      phone: '+1 (555) 123-4567',
      address: '123 Main Street, City, State 12345',
      description: `Experience the finest dining at ${restaurantName} with our carefully crafted menu`,
      hours: 'Mon-Sun: 11:00 AM - 10:00 PM',
      email: 'info@restaurant.com'
    });
    
    setJsonConfig(config);
    setShowJsonModal(true);
  };

  const handleCopyJson = async () => {
    if (!jsonConfig) return;
    
    try {
      await MenuExportService.copyToClipboard(jsonConfig);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleDownloadJson = () => {
    if (!jsonConfig) return;
    
    const filename = `${restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-menu-config.json`;
    MenuExportService.downloadAsJSON(jsonConfig, filename);
  };
  const handleGenerateWebsite = () => {
    if (extractedData) {
      // Navigate to restaurant setup page for backend integration
      onNavigate('setup', extractedData);
    } else {
      // Fallback to original mock generation
      setGenerating(true);
      setTimeout(() => {
        setGenerating(false);
        setGenerated(true);
      }, 4000);
    }
  };

  const JsonExportModal = () => (
    <Modal
      isOpen={showJsonModal}
      onClose={() => setShowJsonModal(false)}
      title="Menu Configuration JSON"
      size="xl"
    >
      <div className="space-y-4">
        <div className="bg-slate-50 p-4 rounded-lg">
          <p className="text-sm text-slate-600 mb-2">
            This JSON configuration can be used directly in your ordering website template:
          </p>
          <div className="flex space-x-2">
            <Button
              onClick={handleCopyJson}
              variant="outline"
              size="sm"
              className={copySuccess ? 'bg-green-50 text-green-700' : ''}
            >
              <Copy className="w-4 h-4 mr-2" />
              {copySuccess ? 'Copied!' : 'Copy JSON'}
            </Button>
            <Button
              onClick={handleDownloadJson}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Download File
            </Button>
          </div>
        </div>
        
        <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto max-h-96">
          <pre className="text-xs whitespace-pre-wrap">
            {jsonConfig ? JSON.stringify(jsonConfig, null, 2) : ''}
          </pre>
        </div>
      </div>
    </Modal>
  );
  const PreviewModal = () => (
    <Modal
      isOpen={showPreview}
      onClose={() => setShowPreview(false)}
      title="Website Preview"
      size="xl"
    >
      <div className="space-y-4">
        <div className="flex justify-center space-x-2">
          <Button
            variant={previewDevice === 'mobile' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setPreviewDevice('mobile')}
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Mobile
          </Button>
          <Button
            variant={previewDevice === 'desktop' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setPreviewDevice('desktop')}
          >
            <Monitor className="w-4 h-4 mr-2" />
            Desktop
          </Button>
        </div>
        
        <div className="flex justify-center">
          <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${
            previewDevice === 'mobile' ? 'w-80 h-96' : 'w-full h-96'
          }`}>
            <div 
              className="h-16 flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: '#3E2522' }}
            >
              Your Restaurant
            </div>
            <div className="p-4 overflow-y-auto h-80">
              <div className="space-y-4">
                {categories.slice(0, 3).map((category) => (
                  <div key={category}>
                    <h3 
                      className="text-lg font-semibold mb-2"
                      style={{ color: '#8C6E63' }}
                    >
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {menuItems
                        .filter(item => item.category === category)
                        .slice(0, 2)
                        .map((item) => (
                          <div key={item.id} className="flex justify-between items-start p-2 bg-gray-50 rounded">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                            <span className="font-bold text-gray-900 ml-4">{item.price}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );

  if (generated) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <CheckCircle className="mx-auto w-16 h-16 text-green-600 mb-4" />
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Website Generated Successfully!</h2>
          <p className="text-slate-600 text-lg">Your custom ordering website is now live and ready for customers.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center text-green-700">
                <Globe className="w-5 h-5 mr-2" />
                Customer Ordering Site
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-700 font-medium">Live URL:</p>
                  <a 
                    href={generatedUrls.customer}
                    className="text-green-600 hover:text-green-700 break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {generatedUrls.customer}
                  </a>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Site
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700">
                <Monitor className="w-5 h-5 mr-2" />
                Kitchen Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium">Dashboard URL:</p>
                  <a 
                    href={generatedUrls.kitchen}
                    className="text-blue-600 hover:text-blue-700 break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {generatedUrls.kitchen}
                  </a>
                </div>
                <div className="flex space-x-2">
                  <Button variant="secondary" size="sm" className="flex-1">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Dashboard
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <div className="flex justify-center space-x-4">
            <Button onClick={() => onNavigate('dashboard')} size="lg">
              Back to Dashboard
            </Button>
            <Button variant="outline" onClick={() => setGenerated(false)}>
              Generate Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (generating) {
    return (
      <div className="p-6">
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <div className="inline-flex items-center space-x-3 text-blue-600 mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-xl font-medium">Generating Your Website...</span>
              </div>
              <div className="space-y-2 text-slate-600">
                <p>✓ Creating your custom ordering interface</p>
                <p>✓ Setting up kitchen dashboard</p>
                <p>✓ Configuring your domain</p>
                <p className="text-blue-600">⏳ Deploying to production...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Review Your Menu</h2>
        <p className="text-slate-600">Review your extracted menu items and proceed to generate your website.</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Menu Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Extracted Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {categories.slice(0, 3).map((category) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b pb-2">
                    {category}
                  </h3>
                  <div className="space-y-3">
                    {menuItems
                      .filter(item => item.category === category)
                      .map((item) => (
                        <div key={item.id} className="flex justify-between items-start p-3 bg-slate-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900">{item.name}</h4>
                            <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                          </div>
                          <span className="font-bold text-slate-900 ml-4">{item.price}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-700">✓ Successfully extracted {menuItems.length} menu items across {categories.length} categories</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <Button
            onClick={() => setShowPreview(true)}
            variant="outline"
            size="lg"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Website
          </Button>

          {extractedData && (
            <Button
              onClick={handleExportJson}
              variant="outline"
              size="lg"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export Menu JSON
            </Button>
          )}
          
          <Button
            onClick={handleGenerateWebsite}
            size="lg"
          >
            <Globe className="w-4 h-4 mr-2" />
            Generate Website
          </Button>
        </div>
      </div>

      <PreviewModal />
      <JsonExportModal />
    </div>
  );
};
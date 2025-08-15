import React, { useState, useCallback, useEffect } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { menuExtractionService, ExtractedMenuData } from '../services/menuExtraction';
import { AdminUser } from '../services/supabaseService';
import { StorageService } from '../services/storageService';

interface MenuUploadProps {
  onNavigate: (page: string, data?: ExtractedMenuData) => void;
  currentUser: AdminUser;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

export const MenuUpload: React.FC<MenuUploadProps> = ({ onNavigate, currentUser }) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [websiteLimit, setWebsiteLimit] = useState<{ canCreate: boolean; existingWebsite?: any }>({ canCreate: true });

  // Check website limit on component mount
  useEffect(() => {
    const checkLimit = async () => {
      try {
        // Use cached websites data to check limit quickly
        const websites = await StorageService.getWebsites(currentUser.id);
        const limit = {
          canCreate: websites.length < 1,
          existingWebsite: websites.length > 0 ? websites[0] : undefined
        };
        
        setWebsiteLimit(limit);
        if (!limit.canCreate) {
          setShowLimitModal(true);
        }
      } catch (error) {
        console.error('Error checking website limit:', error);
      }
    };
    
    checkLimit();
  }, [currentUser.id]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );

    validFiles.forEach(file => {
      const fileId = Math.random().toString(36).substr(2, 9);
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type
      };

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newFile.preview = e.target?.result as string;
          setUploadedFiles(prev => [...prev, newFile]);
        };
        reader.readAsDataURL(file);
      } else {
        setUploadedFiles(prev => [...prev, newFile]);
      }
    });
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleProcessMenu = async () => {
    if (uploadedFiles.length === 0) {
      setError('Please upload at least one menu file before processing.');
      return;
    }

    // Check website limit before processing
    if (!websiteLimit.canCreate) {
      setShowLimitModal(true);
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Convert UploadedFile objects back to File objects for processing
      const files: File[] = [];
      
      for (const uploadedFile of uploadedFiles) {
        if (uploadedFile.type.startsWith('image/') && uploadedFile.preview) {
          // Convert base64 back to File for processing
          const response = await fetch(uploadedFile.preview);
          const blob = await response.blob();
          const file = new File([blob], uploadedFile.name, { type: uploadedFile.type });
          files.push(file);
        }
      }

      if (files.length === 0) {
        throw new Error('No valid image files found for processing.');
      }

      // Extract menu using Gemini
      const extractedData = await menuExtractionService.extractMenuFromFiles(files);
      
      setProcessing(false);
      setProcessed(true);
      
      // Navigate to generator with extracted data after a brief success display
      setTimeout(() => {
        onNavigate('generator', extractedData);
      }, 1500);
      
    } catch (err) {
      setProcessing(false);
      setError(err instanceof Error ? err.message : 'Failed to process menu. Please try again.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload Your Menu</h2>
        <p className="text-slate-600">Upload your restaurant menu files and we'll extract the items automatically using AI.</p>
      </div>

      {/* Upload Area */}
      <Card className="relative">
        <CardContent>
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-slate-900">
                  Drop your menu files here, or{' '}
                  <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                    browse
                    <input
                      type="file"
                      className="sr-only"
                      multiple
                      accept="image/*,.pdf"
                      onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
                    />
                  </label>
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Supports: JPG, PNG, PDF • Max size: 10MB per file
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files ({uploadedFiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center space-x-4 p-3 border border-slate-200 rounded-lg">
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <img 
                        src={file.preview} 
                        alt={file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center">
                        <FileText className="w-6 h-6 text-red-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                    <p className="text-sm text-slate-500">{formatFileSize(file.size)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Status */}
      {processing && (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <div className="inline-flex items-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-lg font-medium">Analyzing your menu with AI...</span>
              </div>
              <p className="text-slate-500 mt-2">
                Gemini AI is extracting menu items, prices, and categories. This may take a few moments.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent>
            <div className="text-center py-8">
              <AlertCircle className="mx-auto w-12 h-12 text-red-600 mb-4" />
              <h3 className="text-lg font-medium text-red-900">Processing Failed</h3>
              <p className="text-red-700 mt-2">{error}</p>
              <Button 
                onClick={() => setError(null)}
                variant="outline"
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success State */}
      {processed && (
        <Card className="border-green-200 bg-green-50">
          <CardContent>
            <div className="text-center py-8">
              <CheckCircle className="mx-auto w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-lg font-medium text-green-900">Menu Processed Successfully!</h3>
              <p className="text-green-700 mt-2">
                Gemini AI has successfully extracted your menu items. Redirecting to website generator...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {uploadedFiles.length > 0 && !processing && !processed && !error && (
        <div className="flex space-x-4">
          <Button 
            onClick={handleProcessMenu}
            className="flex-1"
            size="lg"
          >
            <FileText className="w-4 h-4 mr-2" />
            Process Menu with Gemini AI
          </Button>
          <Button 
            variant="outline"
            onClick={() => onNavigate('dashboard')}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Help Section */}
      <Card className="bg-slate-50">
        <CardContent>
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-slate-900">Tips for better results:</h4>
              <ul className="text-sm text-slate-600 mt-2 space-y-1">
                <li>• Use high-quality, clear images of your menu for best AI extraction</li>
                <li>• Ensure all text is readable and not blurry</li>
                <li>• Images with good contrast work best with Gemini AI</li>
                <li>• Upload multiple pages if your menu spans several pages</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Website Limit Modal */}
      <Modal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        title="Website Limit Reached"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center py-4">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              You've reached your website limit
            </h3>
            <p className="text-slate-600">
              Currently, each user can generate up to 1 website. You already have an active website.
            </p>
          </div>

          {websiteLimit.existingWebsite && (
            <Card className="bg-slate-50">
              <CardContent className="py-4">
                <h4 className="font-medium text-slate-900 mb-2">Your existing website:</h4>
                <div className="text-sm text-slate-600">
                  <p><strong>Name:</strong> {websiteLimit.existingWebsite.name}</p>
                  <p><strong>Status:</strong> {websiteLimit.existingWebsite.is_active ? 'Active' : 'Inactive'}</p>
                  <p><strong>Created:</strong> {new Date(websiteLimit.existingWebsite.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            <h4 className="font-medium text-slate-900">Options:</h4>
            <div className="space-y-2 text-sm text-slate-600">
              <p>• <strong>View your existing website</strong> in the "My Sites" section</p>
              <p>• <strong>Delete your current website</strong> to create a new one</p>
              <p>• <strong>Contact support</strong> to upgrade your account</p>
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button 
              onClick={() => {
                setShowLimitModal(false);
                onNavigate('sites');
              }}
              className="flex-1"
            >
              View My Sites
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowLimitModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
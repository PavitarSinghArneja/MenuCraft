import React, { useState, useEffect } from 'react';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { MenuUpload } from './pages/MenuUpload';
import { WebsiteGenerator } from './pages/WebsiteGenerator';
import { RestaurantProfile } from './pages/RestaurantProfile';
import { RestaurantSetup } from './pages/RestaurantSetup';
import { MySites } from './pages/MySites';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ExtractedMenuData } from './services/menuExtraction';
import { AdminUser } from './services/supabaseService';
import { StorageService } from './services/storageService';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [extractedMenuData, setExtractedMenuData] = useState<ExtractedMenuData | undefined>();
  const [loading, setLoading] = useState(true); // Start with loading true to check for existing session

  // Check for existing session on app load
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        setLoading(true);
        const user = await StorageService.getAuthSession();
        if (user) {
          setCurrentUser(user);
          setIsLoggedIn(true);
          console.log('Session restored for user:', user.email);
        }
      } catch (error) {
        console.warn('Failed to restore session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  const handleLogin = (user: AdminUser) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
    // Save session for 24-hour persistence
    StorageService.setAuthSession(user);
  };

  const handleLogout = async () => {
    try {
      // Clear session from both local storage and Supabase
      await StorageService.clearAuthSession();
    } catch (error) {
      console.warn('Error during logout:', error);
    } finally {
      setCurrentUser(null);
      setIsLoggedIn(false);
      setCurrentPage('dashboard');
      setExtractedMenuData(undefined);
    }
  };

  const handlePageChange = (page: string, data?: ExtractedMenuData) => {
    setCurrentPage(page);
    if (data) {
      setExtractedMenuData(data);
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return { title: 'Dashboard', subtitle: 'Overview of your restaurant websites and performance' };
      case 'sites':
        return { title: 'My Sites', subtitle: 'Manage your generated ordering websites' };
      case 'upload':
        return { title: 'Menu Upload', subtitle: 'Upload and process your restaurant menu' };
      case 'generator':
        return { title: 'Website Generator', subtitle: 'Customize and generate your ordering website' };
      case 'setup':
        return { title: 'Restaurant Setup', subtitle: 'Complete your restaurant configuration' };
      case 'analytics':
        return { title: 'Analytics', subtitle: 'Track orders, revenue, and customer insights' };
      case 'profile':
        return { title: 'Restaurant Profile', subtitle: 'Manage your restaurant information' };
      case 'settings':
        return { title: 'Settings', subtitle: 'Configure your account and preferences' };
      default:
        return { title: 'Dashboard', subtitle: 'Overview of your restaurant websites and performance' };
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handlePageChange} currentUser={currentUser!} />;
      case 'upload':
        return <MenuUpload onNavigate={handlePageChange} currentUser={currentUser!} />;
      case 'generator':
        return <WebsiteGenerator onNavigate={handlePageChange} extractedData={extractedMenuData} currentUser={currentUser!} />;
      case 'setup':
        return (
          <RestaurantSetup 
            extractedData={extractedMenuData!} 
            onBack={() => setCurrentPage('generator')}
            onComplete={() => setCurrentPage('dashboard')}
            currentUser={currentUser!}
          />
        );
      case 'profile':
        return <RestaurantProfile />;
      case 'sites':
        return <MySites onNavigate={handlePageChange} currentUser={currentUser!} />;
      case 'analytics':
      case 'settings':
        return (
          <div className="p-6">
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-slate-900 mb-2">
                {getPageTitle().title} - Coming Soon
              </h3>
              <p className="text-slate-600">
                This feature is under development and will be available in the next update.
              </p>
            </div>
          </div>
        );
      default:
        return <Dashboard onNavigate={handlePageChange} currentUser={currentUser!} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const { title, subtitle } = getPageTitle();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar currentPage={currentPage} onPageChange={handlePageChange} />
      
      <div className="flex-1 flex flex-col">
        <Header title={title} subtitle={subtitle} onLogout={handleLogout} />
        
        <main className="flex-1 overflow-auto">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
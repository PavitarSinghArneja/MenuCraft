import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { User } from './types';
import { loginKitchen, getRestaurantSlugFromUrl } from './services/orderService';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Check for saved login on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('kitchen-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Set browser tab title
    document.title = 'Kitchen | Pajo';
  }, []);

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    setLoginError('');

    try {
      const restaurantSlug = getRestaurantSlugFromUrl();
      if (!restaurantSlug) {
        throw new Error('Restaurant not found. Please check the URL.');
      }

      const authResponse = await loginKitchen(username, password, restaurantSlug);
      
      const userData: User = {
        username: authResponse.user.username,
        isAuthenticated: true
      };
      
      // Save auth token and user data
      localStorage.setItem('kitchen-auth-token', authResponse.token);
      localStorage.setItem('kitchen-user', JSON.stringify(userData));
      setUser(userData);
      
    } catch (err) {
      console.error('Login failed:', err);
      setLoginError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      
      // Fallback to demo login for development
      if (username === 'admin' && password === 'admin123') {
        const userData: User = {
          username,
          isAuthenticated: true
        };
        setUser(userData);
        localStorage.setItem('kitchen-user', JSON.stringify(userData));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('kitchen-user');
    localStorage.removeItem('kitchen-auth-token');
    localStorage.removeItem('kitchen-orders'); // Clear order data on logout
  };

  // Show login if user is not authenticated
  if (!user?.isAuthenticated) {
    return (
      <Login 
        onLogin={handleLogin} 
        isLoading={isLoading} 
        error={loginError} 
      />
    );
  }

  // Show dashboard if user is authenticated
  return <Dashboard onLogout={handleLogout} />;
}

export default App;
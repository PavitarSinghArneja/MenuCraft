import React, { useState } from 'react';
import { useEffect } from 'react';
import { MenuItem as MenuItemType, Customer } from './types';
import { useCart } from './hooks/useCart';
import { useRestaurantConfig } from './hooks/useRestaurantConfig';
import { setTaxRate, setCurrency } from './utils/calculations';
import Header from './components/Header';
import MenuSection from './components/MenuSection';
import Cart from './components/Cart';
import CustomerForm from './components/CustomerForm';
import OrderSummary from './components/OrderSummary';
import LoadingScreen from './components/LoadingScreen';
import ErrorScreen from './components/ErrorScreen';
import { restaurant } from './data/restaurant';

type AppState = 'menu' | 'customer-form' | 'order-summary' | 'complete';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('menu');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  
  // Load restaurant configuration dynamically
  const { config, loading, error, reloadConfig } = useRestaurantConfig();
  
  const {
    items,
    totals,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getItemCount
  } = useCart();

  // Update calculations when config changes
  useEffect(() => {
    if (config) {
      setTaxRate(config.taxRate || 0.085);
      setCurrency(config.currency || 'USD');
      // Update browser tab title
      document.title = `${config.restaurant.name} | Pajo`;
    }
  }, [config]);

  const handleAddToCart = (menuItem: MenuItemType) => {
    addItem(menuItem);
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setCurrentState('customer-form');
  };

  const handleCustomerFormSubmit = (customerData: Customer) => {
    setCustomer(customerData);
    setCurrentState('order-summary');
  };

  const handleOrderComplete = () => {
    clearCart();
    setCustomer(null);
    setCurrentState('complete');
    
    // Reset to menu after 3 seconds
    setTimeout(() => {
      setCurrentState('menu');
    }, 3000);
  };

  // Show loading screen while configuration loads
  if (loading) {
    return <LoadingScreen />;
  }

  // Show error screen if configuration fails to load
  if (error || !config) {
    return <ErrorScreen error={error} onRetry={reloadConfig} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        restaurant={config.restaurant}
        cartItemCount={getItemCount()} 
        onCartClick={() => setIsCartOpen(true)} 
      />

      {currentState === 'menu' && (
        <MenuSection 
          categories={config.menuCategories}
          onAddToCart={handleAddToCart}
        />
      )}

      {currentState === 'customer-form' && (
        <CustomerForm
          onBack={() => setCurrentState('menu')}
          onSubmit={handleCustomerFormSubmit}
        />
      )}

      {currentState === 'order-summary' && customer && (
        <OrderSummary
          items={items}
          customer={customer}
          totals={totals}
          restaurant={config.restaurant}
          estimatedTimePerItem={config.estimatedTimePerItem || 8}
          minimumOrderTime={config.minimumOrderTime || 15}
          onBack={() => setCurrentState('customer-form')}
          onOrderComplete={handleOrderComplete}
        />
      )}

      {currentState === 'complete' && (
        <div className="max-w-2xl mx-auto p-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center p-8">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-black mb-2">Thank You!</h2>
            <p className="text-black">Returning to menu...</p>
          </div>
        </div>
      )}

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={items}
        totals={totals}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onProceedToCheckout={handleProceedToCheckout}
      />
    </div>
  );
}

export default App;


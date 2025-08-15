import { useState, useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '../types';
import { mockOrders } from '../data/mockData';
import { 
  fetchOrdersBySlug, 
  updateOrderStatus as updateOrderStatusAPI, 
  deleteOrder as deleteOrderAPI,
  getRestaurantSlugFromUrl,
  convertOrderFormat
} from '../services/orderService';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load orders from API
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const restaurantSlug = getRestaurantSlugFromUrl();
      if (!restaurantSlug) {
        // Fallback to mock data if no slug found
        setOrders(mockOrders);
        return;
      }

      const backendOrders = await fetchOrdersBySlug(restaurantSlug);
      const convertedOrders = backendOrders.map(convertOrderFormat);
      setOrders(convertedOrders);
      
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      // Fallback to mock data on error
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();

    // Set up polling for new orders every 10 seconds
    const interval = setInterval(() => {
      loadOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, [loadOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      // Convert kitchen app status to backend status
      const backendStatus = newStatus.toUpperCase().replace('-', '_') as any;
      await updateOrderStatusAPI(orderId, backendStatus);
      
      // Update local state optimistically
      setOrders(prev => {
        return prev.map(order => {
          if (order.id === orderId) {
            const updatedOrder = { ...order, status: newStatus };
            
            if (newStatus === 'in-progress') {
              updatedOrder.startedAt = new Date().toISOString();
            } else if (newStatus === 'completed') {
              updatedOrder.completedAt = new Date().toISOString();
            }
            
            return updatedOrder;
          }
          return order;
        });
      });
      
    } catch (err) {
      console.error('Failed to update order status:', err);
      setError('Failed to update order status');
      // Refresh orders to get current state
      setTimeout(() => loadOrders(), 1000);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const authToken = localStorage.getItem('kitchen-auth-token') || '';
      await deleteOrderAPI(orderId, authToken);
      
      // Update local state
      setOrders(prev => prev.filter(order => order.id !== orderId));
      
    } catch (err) {
      console.error('Failed to delete order:', err);
      setError('Failed to delete order');
      // Refresh orders to get current state
      setTimeout(() => loadOrders(), 1000);
    }
  };

  const getPendingOrders = () => orders.filter(order => order.status === 'pending');
  const getInProgressOrders = () => orders.filter(order => order.status === 'in-progress');
  const getCompletedOrders = () => orders.filter(order => order.status === 'completed');
  
  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(order => 
      new Date(order.timestamp).toDateString() === today
    );
    
    return {
      total: todayOrders.length,
      pending: todayOrders.filter(o => o.status === 'pending').length,
      inProgress: todayOrders.filter(o => o.status === 'in-progress').length,
      completed: todayOrders.filter(o => o.status === 'completed').length,
      avgPrepTime: '23 min' // Mock calculation
    };
  };

  return {
    orders,
    updateOrderStatus,
    deleteOrder,
    getPendingOrders,
    getInProgressOrders,
    getCompletedOrders,
    getTodayStats,
    soundEnabled,
    setSoundEnabled,
    loading,
    error,
    refetch: loadOrders
  };
};
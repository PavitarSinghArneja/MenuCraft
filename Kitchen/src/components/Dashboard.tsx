import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Header } from './Header';
import { OrderCard } from './OrderCard';
import { OrderModal } from './OrderModal';
import { useOrders } from '../hooks/useOrders';
import { Order } from '../types';

interface DashboardProps {
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  const { 
    orders, 
    updateOrderStatus, 
    deleteOrder, 
    getPendingOrders, 
    getInProgressOrders, 
    getCompletedOrders,
    getTodayStats,
    soundEnabled,
    setSoundEnabled 
  } = useOrders();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = getTodayStats();
  const pendingOrders = getPendingOrders();
  const inProgressOrders = getInProgressOrders();
  const completedOrders = getCompletedOrders();

  const handleStatusUpdate = (orderId: string, newStatus: any) => {
    updateOrderStatus(orderId, newStatus);
  };

  const handleCancelOrder = (orderId: string) => {
    setShowDeleteConfirm(orderId);
  };

  const confirmDeleteOrder = (orderId: string) => {
    deleteOrder(orderId);
    setShowDeleteConfirm(null);
  };

  const handleRefresh = () => {
    // In a real app, this would fetch latest orders from API
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentTime={currentTime}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onLogout={onLogout}
      />

      <main className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-gray-600 text-sm">Total Today</div>
          </div>

          <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
            <div className="flex items-center justify-center mb-2">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.pending}</div>
            <div className="text-gray-600 text-sm">Pending</div>
          </div>

          <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.inProgress}</div>
            <div className="text-gray-600 text-sm">In Progress</div>
          </div>

          <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.completed}</div>
            <div className="text-gray-600 text-sm">Completed</div>
          </div>

          <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.avgPrepTime}</div>
            <div className="text-gray-600 text-sm">Avg Prep Time</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Order Queue</h2>
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Order Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Orders */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <span>Pending Orders ({pendingOrders.length})</span>
              </h3>
            </div>
            <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
              {pendingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                  onViewDetails={setSelectedOrder}
                  onCancel={handleCancelOrder}
                />
              ))}
              {pendingOrders.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pending orders</p>
                </div>
              )}
            </div>
          </div>

          {/* In Progress Orders */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <Clock className="w-6 h-6 text-orange-500" />
                <span>In Progress ({inProgressOrders.length})</span>
              </h3>
            </div>
            <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
              {inProgressOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                  onViewDetails={setSelectedOrder}
                  onCancel={handleCancelOrder}
                />
              ))}
              {inProgressOrders.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No orders in progress</p>
                </div>
              )}
            </div>
          </div>

          {/* Completed Orders */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span>Completed ({completedOrders.length})</span>
              </h3>
            </div>
            <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
              {completedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                  onViewDetails={setSelectedOrder}
                  onCancel={handleCancelOrder}
                />
              ))}
              {completedOrders.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No completed orders</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Order Details Modal */}
      <OrderModal
        order={selectedOrder!}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Cancel Order</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel order #{showDeleteConfirm}? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => confirmDeleteOrder(showDeleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Yes, Cancel Order
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
              >
                Keep Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
import React, { useState } from 'react';
import { ArrowLeft, Check, Clock, AlertCircle } from 'lucide-react';
import { CartItem, Customer, OrderTotals, Restaurant } from '../types';
import { formatCurrency } from '../utils/calculations';
import { placeOrder, getRestaurantSlugFromUrl, OrderResponse } from '../services/orderService';

interface OrderSummaryProps {
  items: CartItem[];
  customer: Customer;
  totals: OrderTotals;
  restaurant: Restaurant;
  estimatedTimePerItem: number;
  minimumOrderTime: number;
  onBack: () => void;
  onOrderComplete: () => void;
}

export default function OrderSummary({ 
  items, 
  customer, 
  totals, 
  restaurant, 
  estimatedTimePerItem, 
  minimumOrderTime, 
  onBack, 
  onOrderComplete 
}: OrderSummaryProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResponse, setOrderResponse] = useState<OrderResponse | null>(null);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [error, setError] = useState<string>('');

  const estimatedTime = Math.max(minimumOrderTime, items.length * estimatedTimePerItem);

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const restaurantSlug = getRestaurantSlugFromUrl();
      if (!restaurantSlug) {
        throw new Error('Restaurant not found. Please try again.');
      }

      const order = await placeOrder(restaurantSlug, items, customer, totals);
      setOrderResponse(order);
      setIsOrderPlaced(true);

      // Auto-complete after 5 seconds
      setTimeout(() => {
        onOrderComplete();
      }, 5000);

    } catch (err) {
      console.error('Failed to place order:', err);
      setError(err instanceof Error ? err.message : 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isOrderPlaced) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-2">Order Confirmed!</h2>
            <p className="text-black mb-4">Thank you for your order</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-lg font-semibold text-black mb-2">Order #{orderResponse?.orderNumber}</div>
              <div className="flex items-center justify-center gap-2 text-black">
                <Clock size={16} />
                <span>Estimated time: {estimatedTime} minutes</span>
              </div>
              <div className="text-sm text-black mt-2">
                Status: {orderResponse?.status === 'PENDING' ? 'Order received' : orderResponse?.status}
              </div>
            </div>

            <div className="space-y-2 text-sm text-black">
              <p>We'll {customer.orderType === 'dine-in' ? `bring your order to table ${customer.tableNumber}` : `bring your order to your ${customer.carColor} car (${customer.licensePlate})`}</p>
              <p>Questions? Call us at {restaurant.phone}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isSubmitting}
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-2xl font-bold text-black">Order Summary</h2>
          </div>

          {/* Customer Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-black mb-2">Customer Information</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Name:</span> {customer.name}</p>
              <p><span className="font-medium">Phone:</span> {customer.phone}</p>
              <p><span className="font-medium">Order Type:</span> {customer.orderType === 'dine-in' ? 'Dine-In' : 'Drive-In'}</p>
              {customer.orderType === 'dine-in' && customer.tableNumber && (
                <p><span className="font-medium">Table:</span> {customer.tableNumber}</p>
              )}
              {customer.orderType === 'drive-in' && (
                <div>
                  <p><span className="font-medium">Car:</span> {customer.carColor} {customer.carModel && `(${customer.carModel})`}</p>
                  <p><span className="font-medium">License Plate:</span> {customer.licensePlate}</p>
                </div>
              )}
              {customer.notes && (
                <p><span className="font-medium">Special Instructions:</span> {customer.notes}</p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-semibold text-black mb-4">Order Items</h3>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-black">{item.name}</h4>
                    <p className="text-sm text-black">Quantity: {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-black">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Totals */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-black">Subtotal</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Tax (8.5%)</span>
                <span>{formatCurrency(totals.tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Total</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </div>
          </div>

          {/* Estimated Time */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-black">
              <Clock size={16} />
              <span className="font-medium">Estimated preparation time: {estimatedTime} minutes</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-light-accent border border-accent rounded-lg">
              <div className="flex items-center gap-2 text-black">
                <AlertCircle size={16} />
                <span className="font-medium">Order Failed</span>
              </div>
              <p className="text-black text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="w-full py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--primary-color)', color: '#000000' }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Placing Order...
              </span>
            ) : (
              'Place Order'
            )}
          </button>

          <p className="text-xs text-black text-center mt-4">
            By placing this order, you agree to pay the total amount when your food is ready.
          </p>
        </div>
      </div>
    </div>
  );
}
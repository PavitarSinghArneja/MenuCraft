import React from 'react';
import { X, Clock, Phone, MapPin, Car, AlertTriangle, DollarSign } from 'lucide-react';
import { Order } from '../types';
import { formatTime, getTimeElapsed } from '../utils/statusUtils';

interface OrderModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
            <p className="text-gray-600">#{order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Time Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Timeline</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Order Placed</div>
                <div className="flex items-center space-x-2 text-gray-800">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(order.timestamp)} ({getTimeElapsed(order.timestamp)})</span>
                </div>
              </div>
              {order.startedAt && (
                <div>
                  <div className="text-sm text-gray-600">Started Preparing</div>
                  <div className="flex items-center space-x-2 text-gray-800">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(order.startedAt)} ({getTimeElapsed(order.startedAt)})</span>
                  </div>
                </div>
              )}
              {order.completedAt && (
                <div>
                  <div className="text-sm text-gray-600">Completed</div>
                  <div className="flex items-center space-x-2 text-gray-800">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(order.completedAt)} ({getTimeElapsed(order.completedAt)})</span>
                  </div>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-600">Estimated Time</div>
                <div className="text-gray-800 font-medium">{order.estimatedTime}</div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Customer Information</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xl font-bold text-gray-800">{order.customer.name}</div>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-700">
                <Phone className="w-4 h-4" />
                <span>{order.customer.phone}</span>
              </div>

              {order.customer.orderType === 'dine-in' ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <MapPin className="w-5 h-5" />
                  <div>
                    <div className="font-semibold">Dine-In Service</div>
                    <div className="text-2xl font-bold">Table {order.customer.tableNumber}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-blue-600">
                  <Car className="w-5 h-5" />
                  <div>
                    <div className="font-semibold">Drive-In Service</div>
                    <div className="text-lg">{order.customer.carColor} {order.customer.carModel}</div>
                    <div className="text-sm text-gray-600">License: {order.customer.licensePlate}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Special Notes */}
          {order.specialNotes && (
            <div className={`rounded-lg p-4 ${
              order.specialNotes.includes('RUSH') || order.specialNotes.includes('VIP')
                ? 'bg-red-50 border border-red-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-orange-500 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Special Instructions</h3>
                  <p className="text-gray-800">{order.specialNotes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="border-b border-gray-300 pb-3 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                          {item.quantity}
                        </span>
                        <span className="text-gray-800 font-medium text-lg">{item.name}</span>
                      </div>
                      
                      {item.customizations && item.customizations.length > 0 && (
                        <div className="mt-2 ml-9">
                          <div className="text-sm text-gray-600 mb-1">Customizations:</div>
                          <div className="flex flex-wrap gap-1">
                            {item.customizations.map((custom, idx) => (
                              <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {custom}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-gray-800 font-bold text-lg">${item.subtotal.toFixed(2)}</div>
                      <div className="text-gray-600 text-sm">${item.price.toFixed(2)} each</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Order Total</span>
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span>${order.totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Tax:</span>
                <span>${order.totals.tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-300 pt-2 flex justify-between text-gray-800 text-xl font-bold">
                <span>Total:</span>
                <span>${order.totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
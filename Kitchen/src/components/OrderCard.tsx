import React from 'react';
import { Clock, AlertTriangle, Car, MapPin, Phone } from 'lucide-react';
import { Order } from '../types';
import { 
  getStatusColor, 
  getStatusBadgeColor, 
  formatTime, 
  getTimeElapsed, 
  isOrderUrgent,
  statusWorkflow 
} from '../utils/statusUtils';

interface OrderCardProps {
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: any) => void;
  onViewDetails: (order: Order) => void;
  onCancel: (orderId: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ 
  order, 
  onStatusUpdate, 
  onViewDetails, 
  onCancel 
}) => {
  const isUrgent = isOrderUrgent(order.timestamp, order.status);
  const workflow = statusWorkflow[order.status];
  const statusColor = getStatusColor(order.status);
  const badgeColor = getStatusBadgeColor(order.status);

  return (
    <div 
      className={`bg-white border-2 rounded-lg p-4 shadow-sm transition-all hover:shadow-md cursor-pointer ${statusColor} ${
        isUrgent ? 'ring-2 ring-red-400 animate-pulse' : ''
      }`}
      onClick={() => onViewDetails(order)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-xl font-bold text-gray-800">{order.id}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeColor}`}>
            {order.status.toUpperCase()}
          </span>
          {isUrgent && (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          )}
        </div>
        <div className="text-right text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{formatTime(order.timestamp)}</span>
          </div>
          <div className="mt-1 font-medium text-blue-600">
            {getTimeElapsed(order.timestamp)}
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{order.customer.name}</h3>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{order.customer.phone}</span>
            </div>
          </div>
          <div className="text-right">
            {order.customer.orderType === 'dine-in' ? (
              <div className="flex items-center space-x-1 text-green-600">
                <MapPin className="w-4 h-4" />
                <span className="font-semibold">Table {order.customer.tableNumber}</span>
              </div>
            ) : (
              <div className="text-blue-600">
                <div className="flex items-center space-x-1">
                  <Car className="w-4 h-4" />
                  <span className="font-semibold">{order.customer.carColor} {order.customer.carModel}</span>
                </div>
                <div className="text-sm">{order.customer.licensePlate}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-3">
        <div className="space-y-1">
          {order.items.slice(0, 2).map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {item.quantity}x {item.name}
                {item.customizations && item.customizations.length > 0 && (
                  <span className="text-blue-600 ml-1">
                    ({item.customizations.join(', ')})
                  </span>
                )}
              </span>
              <span className="text-gray-800 font-medium">${item.subtotal.toFixed(2)}</span>
            </div>
          ))}
          {order.items.length > 2 && (
            <div className="text-sm text-gray-500 italic">
              +{order.items.length - 2} more items
            </div>
          )}
        </div>
      </div>

      {/* Special Notes */}
      {order.specialNotes && (
        <div className={`mb-3 p-2 rounded-lg ${
          order.specialNotes.includes('RUSH') || order.specialNotes.includes('VIP') 
            ? 'bg-red-50 border border-red-200' 
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
            <span className="text-sm text-gray-800 font-medium">{order.specialNotes}</span>
          </div>
        </div>
      )}

      {/* Total & Actions */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800">${order.totals.total.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Est: {order.estimatedTime}</div>
        </div>
        
        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
          {workflow.nextStatus && (
            <button
              onClick={() => onStatusUpdate(order.id, workflow.nextStatus)}
              className={`px-4 py-2 rounded-lg text-white font-semibold text-sm transition-colors min-w-[120px] ${workflow.buttonColor}`}
            >
              {workflow.buttonText}
            </button>
          )}
          
          {order.status !== 'completed' && (
            <button
              onClick={() => onCancel(order.id)}
              className="px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
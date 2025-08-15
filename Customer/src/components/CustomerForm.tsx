import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Customer } from '../types';

interface CustomerFormProps {
  onBack: () => void;
  onSubmit: (customer: Customer) => void;
}

export default function CustomerForm({ onBack, onSubmit }: CustomerFormProps) {
  const [formData, setFormData] = useState<Customer>({
    name: '',
    phone: '',
    orderType: 'dine-in',
    tableNumber: '',
    carColor: '',
    licensePlate: '',
    carModel: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof Customer, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleOrderTypeChange = (orderType: 'dine-in' | 'drive-in') => {
    setFormData(prev => ({
      ...prev,
      orderType,
      // Clear conditional fields when switching order types
      tableNumber: '',
      carColor: '',
      licensePlate: '',
      carModel: ''
    }));
    // Clear related errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.tableNumber;
      delete newErrors.carColor;
      delete newErrors.licensePlate;
      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.orderType === 'dine-in') {
      if (!formData.tableNumber?.trim()) {
        newErrors.tableNumber = 'Table number is required for dine-in orders';
      }
    } else if (formData.orderType === 'drive-in') {
      if (!formData.carColor?.trim()) {
        newErrors.carColor = 'Car color is required for drive-in orders';
      }
      if (!formData.licensePlate?.trim()) {
        newErrors.licensePlate = 'License plate is required for drive-in orders';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-sm border border-accent overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-2xl font-bold text-black">Customer Information</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">Contact Information</h3>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-black mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-black text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-black mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="(555) 123-4567"
                />
                {errors.phone && <p className="text-black text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Order Type Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">Order Type</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.orderType === 'dine-in' 
                    ? 'border-primary bg-primary bg-opacity-5' 
                    : 'border-gray-300 hover:border-gray-400'
                }`} style={{ 
                  borderColor: formData.orderType === 'dine-in' ? 'var(--primary-color)' : undefined,
                  backgroundColor: formData.orderType === 'dine-in' ? 'color-mix(in srgb, var(--primary-color) 8%, transparent)' : undefined
                }}>
                  <input
                    type="radio"
                    name="orderType"
                    value="dine-in"
                    checked={formData.orderType === 'dine-in'}
                    onChange={(e) => handleOrderTypeChange(e.target.value as 'dine-in' | 'drive-in')}
                    className="sr-only"
                  />
                  <div className="text-center w-full">
                    <div className="text-2xl mb-2">🍽️</div>
                    <div className="font-semibold text-black">Dine-In</div>
                    <div className="text-sm text-black">Table service</div>
                  </div>
                </label>

                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.orderType === 'drive-in' 
                    ? 'border-primary bg-primary bg-opacity-5' 
                    : 'border-gray-300 hover:border-gray-400'
                }`} style={{ 
                  borderColor: formData.orderType === 'drive-in' ? 'var(--primary-color)' : undefined,
                  backgroundColor: formData.orderType === 'drive-in' ? 'color-mix(in srgb, var(--primary-color) 8%, transparent)' : undefined
                }}>
                  <input
                    type="radio"
                    name="orderType"
                    value="drive-in"
                    checked={formData.orderType === 'drive-in'}
                    onChange={(e) => handleOrderTypeChange(e.target.value as 'dine-in' | 'drive-in')}
                    className="sr-only"
                  />
                  <div className="text-center w-full">
                    <div className="text-2xl mb-2">🚗</div>
                    <div className="font-semibold text-black">Drive-In</div>
                    <div className="text-sm text-black">Curbside pickup</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Conditional Fields */}
            <div className={`space-y-4 transition-all duration-300 ${
              formData.orderType === 'dine-in' || formData.orderType === 'drive-in' 
                ? 'opacity-100 max-h-96' 
                : 'opacity-0 max-h-0 overflow-hidden'
            }`}>
              {formData.orderType === 'dine-in' && (
                <div>
                  <h3 className="text-lg font-semibold text-black mb-4">Table Information</h3>
                  <div>
                    <label htmlFor="tableNumber" className="block text-sm font-medium text-black mb-1">
                      Table Number *
                    </label>
                    <input
                      type="text"
                      id="tableNumber"
                      value={formData.tableNumber || ''}
                      onChange={(e) => handleInputChange('tableNumber', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.tableNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 12, A5, etc."
                    />
                    {errors.tableNumber && <p className="text-black text-sm mt-1">{errors.tableNumber}</p>}
                  </div>
                </div>
              )}

              {formData.orderType === 'drive-in' && (
                <div>
                  <h3 className="text-lg font-semibold text-black mb-4">Vehicle Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="carColor" className="block text-sm font-medium text-black mb-1">
                        Car Color *
                      </label>
                      <input
                        type="text"
                        id="carColor"
                        value={formData.carColor || ''}
                        onChange={(e) => handleInputChange('carColor', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                          errors.carColor ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g., Red, Blue, Silver, etc."
                      />
                      {errors.carColor && <p className="text-black text-sm mt-1">{errors.carColor}</p>}
                    </div>

                    <div>
                      <label htmlFor="licensePlate" className="block text-sm font-medium text-black mb-1">
                        License Plate *
                      </label>
                      <input
                        type="text"
                        id="licensePlate"
                        value={formData.licensePlate || ''}
                        onChange={(e) => handleInputChange('licensePlate', e.target.value.toUpperCase())}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                          errors.licensePlate ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="ABC123"
                      />
                      {errors.licensePlate && <p className="text-black text-sm mt-1">{errors.licensePlate}</p>}
                    </div>

                    <div>
                      <label htmlFor="carModel" className="block text-sm font-medium text-black mb-1">
                        Car Make/Model <span className="text-black">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        id="carModel"
                        value={formData.carModel || ''}
                        onChange={(e) => handleInputChange('carModel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="e.g., Toyota Camry, Honda Accord, etc."
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Special Instructions */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-black mb-1">
                Special Instructions <span className="text-black">(Optional)</span>
              </label>
              <textarea
                id="notes"
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Any special requests or dietary restrictions..."
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--primary-color)', color: '#000000' }}
              >
                Continue to Order Summary
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
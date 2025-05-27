'use client';

import React, { useEffect, useState } from 'react';
import { useOrderStatusStore } from './orderStatusStore';
import HelpModal from './HelpModal';

const OrderStatusPage: React.FC = () => {
  const {
    orderId,
    status,
    eta,
    steps,
    items,
    total,
    pickupLocation,
    startMockUpdates,
    stopMockUpdates,
  } = useOrderStatusStore();

  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  useEffect(() => {
    startMockUpdates();
    return () => stopMockUpdates();
  }, []);

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === status);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background text-text dark:text-dark-text transition-colors duration-200">
      {/* Order Summary */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="font-display text-2xl font-bold mb-1">Order Status</h1>
              <p className="text-white/80 font-mono">{orderId}</p>
            </div>
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              Need Help?
            </button>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-sm text-white/80">Estimated Ready Time</p>
                <p className="text-lg font-semibold">{eta}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/80">Total</p>
                <p className="text-lg font-semibold">${total.toFixed(2)}</p>
              </div>
            </div>
            <div className="border-t border-white/20 pt-3">
              <p className="text-sm text-white/80">Pickup Location</p>
              <p className="font-medium">{pickupLocation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Tracker */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary/20 dark:bg-dark-primary/20">
            <div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-primary to-secondary dark:from-dark-primary dark:to-dark-secondary transition-all duration-500"
              style={{
                height: `${(getCurrentStepIndex() / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => {
              const isActive = step.id === status;
              const isCompleted = getCurrentStepIndex() > index;
              const isUpcoming = getCurrentStepIndex() < index;

              return (
                <div
                  key={step.id}
                  className={`relative flex items-start gap-4 transition-all duration-300 ${
                    isUpcoming ? 'opacity-50' : 'opacity-100'
                  }`}
                >
                  {/* Step Icon */}
                  <div
                    className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary to-secondary dark:from-dark-primary dark:to-dark-secondary text-white scale-110 shadow-lg shadow-primary/20 dark:shadow-dark-primary/20 animate-pulse'
                        : isCompleted
                        ? 'bg-primary/10 dark:bg-dark-primary/10 text-primary dark:text-dark-primary'
                        : 'bg-background dark:bg-dark-background/50 border-2 border-primary/20 dark:border-dark-primary/20 text-text/40 dark:text-dark-text/40'
                    }`}
                  >
                    {step.icon}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 pt-1">
                    <h3
                      className={`font-semibold mb-1 transition-colors ${
                        isActive
                          ? 'text-primary dark:text-dark-primary'
                          : isCompleted
                          ? 'text-text dark:text-dark-text'
                          : 'text-text/60 dark:text-dark-text/60'
                      }`}
                    >
                      {step.label}
                    </h3>
                    {step.timestamp && (
                      <p className="text-sm text-text/60 dark:text-dark-text/60">
                        {step.timestamp}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items */}
        <div className="mt-12">
          <h2 className="font-display text-xl font-semibold mb-4">Order Items</h2>
          <div className="bg-white dark:bg-dark-background/50 rounded-xl p-4 space-y-3">
            {items.map((item) => (
              <div
                key={item.name}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-text/80 dark:text-dark-text/80">
                  {item.quantity}x {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reorder CTA */}
        {status === 'picked-up' && (
          <div className="mt-8">
            <button className="w-full bg-gradient-to-r from-primary to-secondary dark:from-dark-primary dark:to-dark-secondary text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity">
              Reorder This
            </button>
          </div>
        )}
      </div>

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
};

export default OrderStatusPage; 
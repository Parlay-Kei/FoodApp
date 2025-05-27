'use client';

import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-dark-background rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text/60 dark:text-dark-text/60 hover:text-text dark:hover:text-dark-text"
        >
          ✕
        </button>
        
        <h2 className="font-display text-2xl font-semibold text-primary dark:text-dark-primary mb-4">
          Need Help?
        </h2>
        
        <div className="space-y-4">
          <div className="bg-background dark:bg-dark-background/50 rounded-xl p-4">
            <h3 className="font-semibold mb-2">Contact Us</h3>
            <p className="text-sm text-text/80 dark:text-dark-text/80">
              Our team is here to help with your order.
            </p>
            <div className="mt-3 space-y-2">
              <a
                href="tel:+1234567890"
                className="flex items-center gap-2 text-primary dark:text-dark-primary hover:opacity-80"
              >
                📞 (123) 456-7890
              </a>
              <a
                href="mailto:support@megansmunchees.com"
                className="flex items-center gap-2 text-primary dark:text-dark-primary hover:opacity-80"
              >
                ✉️ support@megansmunchees.com
              </a>
            </div>
          </div>
          
          <div className="bg-background dark:bg-dark-background/50 rounded-xl p-4">
            <h3 className="font-semibold mb-2">Order Support</h3>
            <p className="text-sm text-text/80 dark:text-dark-text/80">
              For order-related issues, please have your order number ready:
            </p>
            <p className="mt-2 font-mono text-sm bg-primary/5 dark:bg-dark-primary/5 text-primary dark:text-dark-primary px-3 py-1.5 rounded-lg">
              #MM-1742
            </p>
          </div>
          
          <div className="bg-background dark:bg-dark-background/50 rounded-xl p-4">
            <h3 className="font-semibold mb-2">Hours of Operation</h3>
            <p className="text-sm text-text/80 dark:text-dark-text/80">
              Monday - Friday: 11:00 AM - 8:00 PM<br />
              Saturday - Sunday: 10:00 AM - 9:00 PM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal; 
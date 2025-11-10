import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Chip } from '@heroui/react';

const ToastNotification = ({ message, type = 'info', isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const configs = {
    success: {
      color: 'success',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
    },
    error: {
      color: 'danger',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
    },
    warning: {
      color: 'warning',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
    },
    info: {
      color: 'primary',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
    },
    loading: {
      color: 'default',
      icon: (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ),
    },
  };

  const config = configs[type] || configs.info;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed top-4 right-4 z-50 max-w-md"
        >
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="relative p-4">
              <div className="flex items-center gap-3">
                {/* Icon with rounded circle background */}
                <div 
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    config.color === 'success' ? 'bg-success-100 text-success-600' :
                    config.color === 'danger' ? 'bg-danger-100 text-danger-600' :
                    config.color === 'warning' ? 'bg-warning-100 text-warning-600' :
                    config.color === 'default' ? 'bg-gray-100 text-gray-600' :
                    'bg-primary-100 text-primary-600'
                  }`}
                >
                  {config.icon}
                </div>

                {/* Message */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 text-center">{message}</p>
                </div>

                {/* Close Button */}
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={onClose}
                  className="flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </div>

              {/* Progress Bar */}
              {duration > 0 && (
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: duration / 1000, ease: 'linear' }}
                  className={`absolute bottom-0 left-0 h-1 ${
                    config.color === 'success' ? 'bg-success' :
                    config.color === 'danger' ? 'bg-danger' :
                    config.color === 'warning' ? 'bg-warning' :
                    config.color === 'default' ? 'bg-gray-400' :
                    'bg-primary'
                  }`}
                />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ToastNotification;

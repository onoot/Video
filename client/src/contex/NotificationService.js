// client\src\contex\NotificationService.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import {t} from '../utils/t18';
const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const MiniNotification = ({ notification, onClose, duration = 5000 }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (notification.type === 'error') return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - (100 / (duration / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [notification, onClose, duration]);

  if (!notification) return null;

  const getIconContent = () => {
    switch (notification.type) {
      case 'success': return '✓';
      case 'error': return '×';
      case 'warning': return '!';
      case 'info': return 'i';
      default: return 'i';
    }
  };

  const getIconClass = () => {
    switch (notification.type) {
      case 'success': return 'mini-notification-icon success';
      case 'error': return 'mini-notification-icon error';
      case 'warning': return 'mini-notification-icon warning';
      case 'info': return 'mini-notification-icon info';
      default: return 'mini-notification-icon info';
    }
  };

  const getTitle = () => {
    if (notification.title) return notification.title;
    switch (notification.type) {
      case 'success': return t('NotificationService_23');
      case 'error': return t('NotificationService_22');
      case 'warning': return t('NotificationService_21');
      case 'info': return t('NotificationService_20');
      default: return t('NotificationService_19');
    }
  };

  return (
    <div className="mini-notification-container">
      <div className={`mini-notification ${notification.type}`}>
        <button 
          className="mini-notification-close"
          onClick={onClose}
          aria-label={t('NotificationService_18')}
        >
          ×
        </button>
        
        <div className="mini-notification-header">
          <div className={getIconClass()}>
            {getIconContent()}
          </div>
          <h3 className="mini-notification-title">
            {getTitle()}
          </h3>
        </div>
        
        <div className="mini-notification-message">
          {notification.message}
        </div>
        
        <div className="mini-notification-progress-bar-container">
          <div 
            className="mini-notification-progress-bar"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const FullNotification = ({ notification, onClose }) => {
  if (!notification) return null;

  const getIconContent = () => {
    switch (notification.type.replace('full-', '')) {
      case 'success': return '✓';
      case 'error': return '×';
      case 'warning': return '!';
      case 'info': return 'i';
      default: return 'i';
    }
  };

  const getIconClass = () => {
    const baseType = notification.type.replace('full-', '');
    switch (baseType) {
      case 'success': return 'full-notification-icon success';
      case 'error': return 'full-notification-icon error';
      case 'warning': return 'full-notification-icon warning';
      case 'info': return 'full-notification-icon info';
      default: return 'full-notification-icon info';
    }
  };

  const getTitle = () => {
    if (notification.title) return notification.title;
    const baseType = notification.type.replace('full-', '');
    switch (baseType) {
      case 'success': return t('NotificationService_17');
      case 'error': return t('NotificationService_16');
      case 'warning': return t('NotificationService_15');
      case 'info': return t('NotificationService_14');
      default: return t('NotificationService_13');
    }
  };

  return (
    <div className="full-notification-overlay" onClick={onClose}>
      <div className="full-notification-popup" onClick={e => e.stopPropagation()}>
        <button 
          className="full-notification-close"
          onClick={onClose}
          aria-label={t('NotificationService_12')}
        >
          ×
        </button>
        
        <div className="full-notification-icon-wrapper">
          <div className={getIconClass()}>
            {getIconContent()}
          </div>
        </div>
        
        <h2 className="full-notification-title">
          {getTitle()}
        </h2>
        
        <div className="full-notification-message">
          {notification.message}
        </div>
        
        <div className="full-notification-actions">
          <button
            className="full-notification-button"
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

const Notification = ({ notification, onClose }) => {
  if (!notification) return null;

  if (notification.type.startsWith('full-')) {
    return <FullNotification notification={notification} onClose={onClose} />;
  } else {
    return <MiniNotification notification={notification} onClose={onClose} />;
  }
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message, title = '') => {
    setNotification({ type, message, title });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  useEffect(() => {
    if (notification && !notification.type.startsWith('full-') && notification.type !== 'error') {
      const timer = setTimeout(() => {
        hideNotification();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      <Notification notification={notification} onClose={hideNotification} />
    </NotificationContext.Provider>
  );
};
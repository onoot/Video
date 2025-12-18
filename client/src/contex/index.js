// client\src\contex\index.js
import React, { createContext, useContext } from 'react';



export const StorageContext = createContext();
export const UserContext = createContext(null);
export const TranslateContext = createContext(null);

export { NotificationProvider, useNotification } from './NotificationService';

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
};


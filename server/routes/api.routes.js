// routes/api.routes.js
const express = require('express');
const auth = require('../middleware/auth');
const {
  // Получение
  getWatcher,
  getQueue,
  getPresets,
  getRenameRules,
  getCategories,
  getServerInfo,
  getTaskHistory,
  getFileSystemStructure,
  
  // Создание
  createWatcher,
  createQueueItem,
  createPreset,
  createRenameRule,
  createCategory,
  
  // Обновление
  updateQueueItem,
  updateWatcher,
  updatePreset,
  
  // Удаление
  deleteQueueItem,
  deleteWatcher,
  deletePreset,
  deleteRenameRule,
  
  // Файловые операции
  createDirectory,
  deleteFileOrDirectory,
  
  // Системные операции
  startProcessing,
  stopProcessing,
  pauseProcessing,
  resumeProcessing,
  clearCompleted,
} = require('../controllers/api.controller');
const {
  getSettings,
  getSettingByKey,
  updateSettings,
  resetToDefault
} = require('../controllers/settings.controller');
const router = express.Router();

// ===== ЧТЕНИЕ =====
router.get('/watcher', auth, getWatcher);
router.get('/queue', auth, getQueue);
router.get('/presets', auth, getPresets);
router.get('/rename-rules', auth, getRenameRules);
router.get('/categories', auth, getCategories);
router.get('/server-info', auth, getServerInfo);
router.get('/task-history', auth, getTaskHistory);
router.get('/fs', auth, getFileSystemStructure);

// ===== НАСТРОЙКИ =====
router.get('/settings', auth, getSettings);
router.get('/settings/:key', auth, getSettingByKey);
router.put('/settings', auth, updateSettings);
router.post('/settings/reset', auth, resetToDefault);

// ===== СОЗДАНИЕ =====
router.post('/watcher', auth, createWatcher);
router.post('/queue', auth, createQueueItem);
router.post('/presets', auth, createPreset);
router.post('/rename-rules', auth, createRenameRule);
router.post('/categories', auth, createCategory);

// ===== ОБНОВЛЕНИЕ =====
router.put('/queue/:id', auth, updateQueueItem);
router.put('/watcher/:id', auth, updateWatcher);
router.put('/presets/:id', auth, updatePreset);

// ===== ФАЙЛОВЫЕ ОПЕРАЦИИ =====
router.post('/fs/directory', auth, createDirectory);
router.delete('/fs', auth, deleteFileOrDirectory);

// ===== СИСТЕМНЫЕ ОПЕРАЦИИ =====
router.post('/queue/start', auth, startProcessing);
router.post('/queue/stop', auth, stopProcessing);
router.post('/queue/pause', auth, pauseProcessing);
router.post('/queue/resume', auth, resumeProcessing);
router.delete('/queue/clear-completed', auth, clearCompleted);

// ===== УДАЛЕНИЕ =====
router.delete('/queue/:id', auth, deleteQueueItem);
router.delete('/watcher/:id', auth, deleteWatcher);
router.delete('/presets/:id', auth, deletePreset);
router.delete('/rename-rules/:id', auth, deleteRenameRule);

module.exports = router;
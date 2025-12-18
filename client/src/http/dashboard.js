// client/src/http/dashboard.js
import { $authHost } from './index';


// Настройки
export const fetchSettings = () => $authHost.get('/api/settings').then(r => r.data);
export const updateSettings = (data) => $authHost.put('/api/settings', data).then(r => r.data);
export const resetSettings = (data) => $authHost.post('/api/settings/reset', data).then(r => r.data);

// Получение данных
export const fetchWatcher = () => $authHost.get('/api/watcher').then(r => r.data);
export const fetchQueue = () => $authHost.get('/api/queue').then(r => r.data);
export const fetchPresets = () => $authHost.get('/api/presets').then(r => r.data);
export const fetchRenameRules = () => $authHost.get('/api/rename-rules').then(r => r.data);
export const fetchCategories = () => $authHost.get('/api/categories').then(r => r.data);
export const fetchServerInfo = () => $authHost.get('/api/server-info').then(r => r.data);
export const fetchTaskHistory = () => $authHost.get('/api/task-history').then(r => r.data);

// Создание
export const createWatcher = (data) => $authHost.post('/api/watcher', data).then(r => r.data);
export const createQueueItem = (data) => $authHost.post('/api/queue', data).then(r => r.data);
export const createPreset = (data) => $authHost.post('/api/presets', data).then(r => r.data);
export const createRenameRule = (data) => $authHost.post('/api/rename-rules', data).then(r => r.data);
export const createCategory = (data) => $authHost.post('/api/categories', data).then(r => r.data);

// Обновление
export const updateQueueItem = (id, data) => $authHost.put(`/api/queue/${id}`, data).then(r => r.data);
export const updateWatcher = (id, data) => $authHost.put(`/api/watcher/${id}`, data).then(r => r.data);
export const updatePreset = (id, data) => $authHost.put(`/api/presets/${id}`, data).then(r => r.data);

// Удаление
export const deleteQueueItem = (id) => $authHost.delete(`/api/queue/${id}`).then(r => r.data);
export const deleteWatcher = (id) => $authHost.delete(`/api/watcher/${id}`).then(r => r.data);
export const deletePreset = (id) => $authHost.delete(`/api/presets/${id}`).then(r => r.data);
export const deleteRenameRule = (id) => $authHost.delete(`/api/rename-rules/${id}`).then(r => r.data);

// Файловая система
export const fetchFileSystem = (root = '') =>
  $authHost.get(`/api/fs?root=${encodeURIComponent(root)}`).then(r => r.data);

// Системные операции
export const startProcessing = () => $authHost.post('/api/queue/start').then(r => r.data);
export const stopProcessing = () => $authHost.post('/api/queue/stop').then(r => r.data);
export const pauseProcessing = () => $authHost.post('/api/queue/pause').then(r => r.data);
export const resumeProcessing = () => $authHost.post('/api/queue/resume').then(r => r.data);
export const clearCompleted = () => $authHost.delete('/api/queue/clear-completed').then(r => r.data);

// Дополнительные операции с файлами
export const createDirectory = (path) => 
  $authHost.post('/api/fs/directory', { path }).then(r => r.data);

export const deleteFileOrDirectory = (path) => 
  $authHost.delete(`/api/fs?path=${encodeURIComponent(path)}`).then(r => r.data);

export const uploadFile = (formData) => 
  $authHost.post('/api/fs/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data);
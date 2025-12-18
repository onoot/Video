import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contex/index';
import { useStorage } from '../../contex/index';
import { 
  fetchWatcher, 
  deleteWatcher,
  updateWatcher,
  createWatcher
} from '../../http/dashboard';
import CreateWatcherModal from '../../ui/Modals/main/CreateWatcherModal';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tooltip,
  Switch,
  Grid,
  Card,
  CardContent,
  alpha,
  Badge,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Visibility as ViewIcon,
  Folder as FolderIcon,
  Settings as SettingsIcon,
  NotificationsActive as ActiveIcon,
  NotificationsOff as InactiveIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';

const WatchersPage = () => {
  const [watchers, setWatchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWatcher, setEditingWatcher] = useState(null);
  const [actionDialog, setActionDialog] = useState({ 
    open: false, 
    type: '', 
    watcherId: null, 
    watcherName: '' 
  });
  
  const { showNotification } = useNotification();
  const { user } = useStorage();

  const loadWatchers = async () => {
    setLoading(true);
    try {
      const data = await fetchWatcher();
      setWatchers(data || []);
      setError('');
    } catch (err) {
      setError('Не удалось загрузить наблюдателей');
      console.error('Ошибка загрузки наблюдателей:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatchers();
    // Автообновление каждые 10 секунд
    const interval = setInterval(loadWatchers, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleWatcherCreated = () => {
    loadWatchers();
    showNotification('success', 'Наблюдатель успешно создан');
  };

  const handleWatcherUpdated = () => {
    loadWatchers();
    showNotification('success', 'Наблюдатель успешно обновлен');
  };

  const handleToggleWatcher = async (watcherId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateWatcher(watcherId, { status: newStatus });
      showNotification('success', `Наблюдатель ${newStatus === 'active' ? 'активирован' : 'деактивирован'}`);
      loadWatchers();
    } catch (err) {
      showNotification('error', 'Не удалось изменить статус наблюдателя');
    }
  };

  const handleDeleteWatcher = async () => {
    try {
      await deleteWatcher(actionDialog.watcherId);
      setWatchers(watchers.filter(w => w.id !== actionDialog.watcherId));
      showNotification('success', 'Наблюдатель успешно удален');
      setActionDialog({ open: false, type: '', watcherId: null, watcherName: '' });
    } catch (err) {
      showNotification('error', 'Не удалось удалить наблюдателя');
      console.error('Ошибка удаления наблюдателя:', err);
    }
  };

  const handleEditClick = (watcher) => {
    setEditingWatcher(watcher);
    setShowEditModal(true);
  };

  const handleActionClick = (type, watcher) => {
    setActionDialog({
      open: true,
      type,
      watcherId: watcher.id,
      watcherName: watcher.name || 'Наблюдатель'
    });
  };

  // Определение цвета статуса
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'warning': return 'warning';
      case 'paused': return 'default';
      default: return 'default';
    }
  };

  // Определение текста статуса
  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'inactive': return 'Неактивен';
      case 'warning': return 'Предупреждение';
      case 'paused': return 'Приостановлен';
      default: return status;
    }
  };

  // Определение цвета состояния
  const getHealthColor = (health) => {
    switch (health) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  // Форматирование времени
  const formatTime = (time) => {
    if (!time) return '—';
    return new Date(time).toLocaleString('ru-RU');
  };

  // Расчет времени работы
  const calculateUptime = (startTime) => {
    if (!startTime) return '—';
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now - start;
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} д ${hours} ч`;
    if (hours > 0) return `${hours} ч ${minutes} мин`;
    return `${minutes} мин`;
  };

  // Получение последнего события
  const getLastEvent = (watcher) => {
    if (watcher.lastError) {
      return {
        type: 'error',
        message: watcher.lastError,
        time: watcher.lastErrorTime
      };
    }
    if (watcher.lastProcessed) {
      return {
        type: 'success',
        message: `Обработан: ${watcher.lastProcessed}`,
        time: watcher.lastProcessedTime
      };
    }
    return null;
  };

  // Статистика наблюдателей
  const stats = {
    total: watchers.length,
    active: watchers.filter(w => w.status === 'active').length,
    inactive: watchers.filter(w => w.status === 'inactive').length,
    warning: watchers.filter(w => w.health === 'warning').length,
    critical: watchers.filter(w => w.health === 'critical').length,
    totalFiles: watchers.reduce((sum, w) => sum + (w.processedFiles || 0), 0),
    totalErrors: watchers.reduce((sum, w) => sum + (w.errorCount || 0), 0),
  };

  // Расчет использования ресурсов
  const calculateResourceUsage = (watcher) => {
    const memoryMB = watcher.memoryUsage ? Math.round(watcher.memoryUsage / 1024 / 1024) : 0;
    const cpuPercent = watcher.cpuUsage || 0;
    return { memoryMB, cpuPercent };
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            Выполнить
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadWatchers}
              disabled={loading}
            >
              Обновить
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowCreateModal(true)}
            >
              Добавить
            </Button>
          </Box>
        </Box>

        {/* Статистика */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: alpha('#2196f3', 0.1) }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ActiveIcon color="primary" />
                  <Typography color="text.secondary">
                    Всего
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: alpha('#4caf50', 0.1) }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <SuccessIcon color="success" />
                  <Typography color="text.secondary">
                    Активные
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {stats.active}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: alpha('#ff9800', 0.1) }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <WarningIcon color="warning" />
                  <Typography color="text.secondary">
                    Предупреждения
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {stats.warning}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: alpha('#f44336', 0.1) }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <InactiveIcon color="error" />
                  <Typography color="text.secondary">
                    Критические
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {stats.critical}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Общая статистика */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Обработано файлов
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {stats.totalFiles.toLocaleString('ru-RU')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Всего ошибок
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="error">
                  {stats.totalErrors.toLocaleString('ru-RU')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Таблица наблюдателей */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : watchers.length === 0 ? (
          <Alert severity="info" sx={{ m: 2 }}>
            Наблюдатели не найдены. Создайте нового наблюдателя.
          </Alert>
        ) : (
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Имя</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Статус</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Состояние</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Пути</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Пресет</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Обработано</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Время работы</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {watchers.map((watcher) => {
                  const lastEvent = getLastEvent(watcher);
                  const resourceUsage = calculateResourceUsage(watcher);
                  
                  return (
                    <TableRow 
                      key={watcher.id}
                      hover
                      sx={{ 
                        '&:hover': { backgroundColor: 'action.hover' },
                        bgcolor: watcher.health === 'critical' ? alpha('#f44336', 0.05) : 
                                 watcher.health === 'warning' ? alpha('#ff9800', 0.05) : 'inherit'
                      }}
                    >
                      <TableCell>
                        <Box>
                          <Typography fontWeight="medium" noWrap>
                            {watcher.name || 'Без названия'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {watcher.id.slice(0, 8)}...
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Switch
                            size="small"
                            checked={watcher.status === 'active'}
                            onChange={() => handleToggleWatcher(watcher.id, watcher.status)}
                            color="success"
                          />
                          <Chip 
                            label={getStatusText(watcher.status)} 
                            size="small" 
                            color={getStatusColor(watcher.status)}
                            variant="outlined"
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={watcher.health || 'healthy'} 
                            size="small" 
                            color={getHealthColor(watcher.health)}
                            variant="filled"
                          />
                          {lastEvent && (
                            <Tooltip title={`${lastEvent.message} (${formatTime(lastEvent.time)})`}>
                              <IconButton size="small" color={lastEvent.type === 'error' ? 'error' : 'success'}>
                                {lastEvent.type === 'error' ? <WarningIcon /> : <SuccessIcon />}
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" noWrap>
                            <FolderIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                            {watcher.watchDir?.split('/').pop() || '—'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            → {watcher.outputDir?.split('/').pop() || '—'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={watcher.preset || '—'} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            📄 {watcher.processedFiles || 0}
                          </Typography>
                          <Typography variant="caption" color="error">
                            ⚠️ {watcher.errorCount || 0}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {watcher.startedAt ? calculateUptime(watcher.startedAt) : '—'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {watcher.startedAt && formatTime(watcher.startedAt)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                          {/* Кнопка редактирования */}
                          <Tooltip title="Редактировать">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEditClick(watcher)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {/* Кнопка просмотра деталей */}
                          <Tooltip title="Подробности">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => {
                                // Здесь можно открыть модалку с деталями
                                showNotification('info', 'Детали наблюдателя');
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {/* Кнопка удаления */}
                          <Tooltip title="Удалить">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleActionClick('delete', watcher)}
                              disabled={watcher.status === 'active'}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {/* Индикатор использования ресурсов */}
                          {resourceUsage.memoryMB > 0 && (
                            <Tooltip title={`Память: ${resourceUsage.memoryMB}MB, CPU: ${resourceUsage.cpuPercent}%`}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={Math.min(resourceUsage.cpuPercent, 100)} 
                                  sx={{ width: 40 }}
                                  color={
                                    resourceUsage.cpuPercent > 80 ? 'error' :
                                    resourceUsage.cpuPercent > 50 ? 'warning' : 'success'
                                  }
                                />
                              </Box>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={actionDialog.open && actionDialog.type === 'delete'}
        onClose={() => setActionDialog({ open: false, type: '', watcherId: null, watcherName: '' })}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить наблюдателя <strong>{actionDialog.watcherName}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Все связанные данные будут удалены. Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, type: '', watcherId: null, watcherName: '' })}>
            Отмена
          </Button>
          <Button 
            onClick={handleDeleteWatcher} 
            color="error" 
            variant="contained"
            autoFocus
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно создания наблюдателя */}
      <CreateWatcherModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleWatcherCreated}
      />

      {/* Модальное окно редактирования наблюдателя */}
      {editingWatcher && (
        <CreateWatcherModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingWatcher(null);
          }}
          onUpdated={handleWatcherUpdated}
          preset={editingWatcher}
          mode="edit"
        />
      )}
    </Box>
  );
};

export default WatchersPage;
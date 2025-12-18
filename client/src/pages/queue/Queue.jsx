import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contex/index';
import { useStorage } from '../../contex/index';
import { 
  fetchQueue, 
  deleteQueueItem, 
  updateQueueItem,
  startProcessing,
  stopProcessing,
  pauseProcessing,
  resumeProcessing,
  clearCompleted
} from '../../http/dashboard';
import CreateQueueModal from '../../ui/Modals/main/CreateQueueModal';
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
  LinearProgress,
  Grid,
  Card,
  CardContent,
  Stack,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Pause as PauseIcon,
  PlayCircleFilled as ResumeIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ClearAll as ClearAllIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  PriorityHigh as PriorityIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

const QueuePage = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionDialog, setActionDialog] = useState({ 
    open: false, 
    type: '', 
    itemId: null, 
    itemName: '' 
  });
  
  const { showNotification } = useNotification();
  const { user } = useStorage();

  const loadQueue = async () => {
    setLoading(true);
    try {
      const data = await fetchQueue();
      setQueue(data || []);
      setError('');
      
      const hasActive = data?.some(item => 
        item.status === 'processing' || item.status === 'pending'
      );
      setProcessing(hasActive);
    } catch (err) {
      setError('Не удалось загрузить очередь');
      console.error('Ошибка загрузки очереди:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStartProcessing = async () => {
    try {
      await startProcessing();
      showNotification('success', 'Обработка очереди запущена');
      setProcessing(true);
      loadQueue();
    } catch (err) {
      showNotification('error', 'Не удалось запустить обработку');
    }
  };

  const handleStopProcessing = async () => {
    try {
      await stopProcessing();
      showNotification('success', 'Обработка очереди остановлена');
      setProcessing(false);
      loadQueue();
    } catch (err) {
      showNotification('error', 'Не удалось остановить обработку');
    }
  };

  const handlePauseProcessing = async () => {
    try {
      await pauseProcessing();
      showNotification('info', 'Обработка очереди приостановлена');
      loadQueue();
    } catch (err) {
      showNotification('error', 'Не удалось приостановить обработку');
    }
  };

  const handleResumeProcessing = async () => {
    try {
      await resumeProcessing();
      showNotification('success', 'Обработка очереди возобновлена');
      loadQueue();
    } catch (err) {
      showNotification('error', 'Не удалось возобновить обработку');
    }
  };

  const handleClearCompleted = async () => {
    try {
      await clearCompleted();
      showNotification('success', 'Завершенные задачи очищены');
      loadQueue();
    } catch (err) {
      showNotification('error', 'Не удалось очистить завершенные задачи');
    }
  };

  const handleDeleteItem = async () => {
    try {
      await deleteQueueItem(actionDialog.itemId);
      setQueue(queue.filter(item => item.id !== actionDialog.itemId));
      showNotification('success', 'Задача удалена из очереди');
      setActionDialog({ open: false, type: '', itemId: null, itemName: '' });
    } catch (err) {
      showNotification('error', 'Не удалось удалить задачу');
    }
  };

  const handleChangePriority = async (itemId, priority) => {
    try {
      await updateQueueItem(itemId, { priority });
      showNotification('success', 'Приоритет задачи изменен');
      loadQueue();
    } catch (err) {
      showNotification('error', 'Не удалось изменить приоритет');
    }
  };

  const handleQueueItemCreated = () => {
    loadQueue();
    showNotification('success', 'Задача добавлена в очередь');
  };

  const handleActionClick = (type, item) => {
    setActionDialog({
      open: true,
      type,
      itemId: item.id,
      itemName: item.name || item.inputPath || 'Задача'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'paused': return 'default';
      case 'cancelled': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'processing': return 'В процессе';
      case 'completed': return 'Завершено';
      case 'failed': return 'Ошибка';
      case 'paused': return 'Приостановлено';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const formatTime = (time) => {
    if (!time) return '—';
    return new Date(time).toLocaleString('ru-RU');
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime) return '—';
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    
    if (diffMins > 0) {
      return `${diffMins} мин ${diffSecs} сек`;
    }
    return `${diffSecs} сек`;
  };

  const calculateProgress = (item) => {
    if (item.progress !== undefined) return item.progress;
    if (item.status === 'completed') return 100;
    if (item.status === 'processing') return 50;
    return 0;
  };

  const stats = {
    total: queue.length,
    pending: queue.filter(item => item.status === 'pending').length,
    processing: queue.filter(item => item.status === 'processing').length,
    completed: queue.filter(item => item.status === 'completed').length,
    failed: queue.filter(item => item.status === 'failed').length,
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
              onClick={loadQueue}
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

        {/* Кнопки управления очередью */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              startIcon={<PlayIcon />}
              onClick={handleStartProcessing}
              disabled={processing}
            >
              Запустить
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              color="error"
              startIcon={<StopIcon />}
              onClick={handleStopProcessing}
              disabled={!processing}
            >
              Остановить
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              color="warning"
              startIcon={<PauseIcon />}
              onClick={handlePauseProcessing}
              disabled={!processing}
            >
              Приостановить
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              startIcon={<ClearAllIcon />}
              onClick={handleClearCompleted}
            >
              Очистить завершенные
            </Button>
          </Grid>
        </Grid>

        {/* Статистика */}
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: alpha('#2196f3', 0.1) }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Всего задач
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: alpha('#ff9800', 0.1) }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Ожидает
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.pending}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: alpha('#00bcd4', 0.1) }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  В процессе
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.processing}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: alpha('#4caf50', 0.1) }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Завершено
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.completed}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : queue.length === 0 ? (
          <Alert severity="info" sx={{ m: 2 }}>
            Очередь пуста. Добавьте новую задачу.
          </Alert>
        ) : (
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Задача</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Статус</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Прогресс</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Приоритет</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Время создания</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Длительность</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {queue.map((item, index) => (
                  <TableRow 
                    key={item.id}
                    hover
                    sx={{ 
                      '&:hover': { backgroundColor: 'action.hover' },
                      bgcolor: item.status === 'processing' ? alpha('#00bcd4', 0.05) : 'inherit'
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight="medium">
                        {index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography fontWeight="medium" noWrap>
                          {item.name || item.inputPath?.split('/').pop() || 'Задача'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Пресет: {item.preset || '—'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusText(item.status)} 
                        size="small" 
                        color={getStatusColor(item.status)}
                        variant={item.status === 'processing' ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell width={200}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={calculateProgress(item)} 
                            color={
                              item.status === 'failed' ? 'error' :
                              item.status === 'completed' ? 'success' : 'primary'
                            }
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {calculateProgress(item)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={item.priority || 'normal'} 
                        size="small" 
                        color={getPriorityColor(item.priority)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatTime(item.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {calculateDuration(item.startedAt, item.completedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title="Высокий приоритет">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleChangePriority(item.id, 'high')}
                            disabled={item.status === 'processing' || item.status === 'completed'}
                          >
                            <PriorityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Средний приоритет">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleChangePriority(item.id, 'medium')}
                            disabled={item.status === 'processing' || item.status === 'completed'}
                          >
                            <PriorityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Низкий приоритет">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleChangePriority(item.id, 'low')}
                            disabled={item.status === 'processing' || item.status === 'completed'}
                          >
                            <PriorityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Удалить">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleActionClick('delete', item)}
                            disabled={item.status === 'processing'}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {item.status === 'paused' && (
                          <Tooltip title="Возобновить">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleResumeProcessing()}
                            >
                              <ResumeIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, type: '', itemId: null, itemName: '' })}
      >
        <DialogTitle>
          {actionDialog.type === 'delete' ? 'Подтверждение удаления' : 'Подтверждение действия'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {actionDialog.type === 'delete' && (
              <>Вы уверены, что хотите удалить задачу <strong>{actionDialog.itemName}</strong> из очереди?</>
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {actionDialog.type === 'delete' && 'Это действие нельзя отменить.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, type: '', itemId: null, itemName: '' })}>
            Отмена
          </Button>
          <Button 
            onClick={actionDialog.type === 'delete' ? handleDeleteItem : null}
            color="error" 
            variant="contained"
            autoFocus
          >
            {actionDialog.type === 'delete' ? 'Удалить' : 'Подтвердить'}
          </Button>
        </DialogActions>
      </Dialog>

      <CreateQueueModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleQueueItemCreated}
      />
    </Box>
  );
};

export default QueuePage;
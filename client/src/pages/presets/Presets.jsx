import React, { useState, useEffect } from 'react';
import { useNotification, useStorage } from '../../contex/index';
import { 
  fetchPresets, 
  deletePreset,
  updatePreset 
} from '../../http/dashboard';
import CreatePresetModal from '../../ui/Modals/main/CreatePresetModal';
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
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

const PresetsPage = () => {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, presetId: null, presetName: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  const { showNotification } = useNotification();
  const { user } = useStorage();

  const loadPresets = async () => {
    setLoading(true);
    try {
      const data = await fetchPresets();
      setPresets(data || []);
      setError('');
    } catch (err) {
      setError('Не удалось загрузить пресеты');
      console.error('Ошибка загрузки пресетов:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPresets();
  }, []);

  const handlePresetCreated = () => {
    loadPresets();
    showNotification('success', 'Пресет успешно создан');
  };

  const handlePresetUpdated = () => {
    loadPresets();
    showNotification('success', 'Пресет успешно обновлен');
  };

  const handleDeletePreset = async () => {
    try {
      await deletePreset(deleteDialog.presetId);
      setPresets(presets.filter(p => p.id !== deleteDialog.presetId));
      showNotification('success', 'Пресет успешно удален');
      setDeleteDialog({ open: false, presetId: null, presetName: '' });
    } catch (err) {
      showNotification('error', 'Не удалось удалить пресет');
      console.error('Ошибка удаления пресета:', err);
    }
  };

  const handleEditClick = (preset) => {
    setEditingPreset(preset);
    setShowEditModal(true);
  };

  const handleDeleteClick = (preset) => {
    setDeleteDialog({
      open: true,
      presetId: preset.id,
      presetName: preset.name
    });
  };

  // Безопасная функция для получения строки в нижнем регистре
  const safeToLowerCase = (str) => {
    return (str || '').toString().toLowerCase();
  };

  const filteredPresets = presets.filter(preset => {
    // Безопасный поиск по всем полям
    const searchTermLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      safeToLowerCase(preset.name).includes(searchTermLower) ||
      safeToLowerCase(preset.category).includes(searchTermLower) ||
      (preset.description && safeToLowerCase(preset.description).includes(searchTermLower));
    
    // Фильтрация по категории
    const matchesCategory = 
      filterCategory === 'all' || 
      filterCategory === '' || 
      preset.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(presets.map(p => p.category).filter(Boolean))];

  const formatFileSize = (size) => {
    if (!size) return '—';
    const num = parseInt(size);
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    if (num < 1024 * 1024 * 1024) return `${(num / (1024 * 1024)).toFixed(1)} MB`;
    return `${(num / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  // Безопасное получение значения для отображения
  const safeValue = (value, defaultValue = '—') => {
    return value || defaultValue;
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
              onClick={loadPresets}
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

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Поиск по названию, категории или описанию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ flexGrow: 1, minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            label="Категория"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
            SelectProps={{
              native: true,
            }}
          >
            <option value="all">Все категории</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </TextField>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('all');
            }}
          >
            Сбросить фильтры
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Chip 
            label={`Всего: ${presets.length}`} 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            label={`Активные: ${presets.filter(p => p.status === 'active').length}`} 
            color="success" 
            variant="outlined" 
          />
          <Chip 
            label={`Категорий: ${categories.length}`} 
            color="info" 
            variant="outlined" 
          />
        </Box>
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
        ) : filteredPresets.length === 0 ? (
          <Alert severity="info" sx={{ m: 2 }}>
            {searchTerm || filterCategory !== 'all' ? 'Пресеты не найдены по заданным фильтрам' : 'Пресеты отсутствуют'}
          </Alert>
        ) : (
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Название</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Категория</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Формат</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Разрешение</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Кодек</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Битрейт</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>FPS</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Статус</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Дата создания</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPresets.map((preset) => (
                  <TableRow 
                    key={preset.id}
                    hover
                    sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                  >
                    <TableCell>
                      <Box>
                        <Typography fontWeight="medium">
                          {safeValue(preset.name)}
                        </Typography>
                        {preset.description && (
                          <Typography variant="caption" color="text.secondary">
                            {preset.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={safeValue(preset.category)} 
                        size="small" 
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={safeValue(preset.format)} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {safeValue(preset.resolution)}
                    </TableCell>
                    <TableCell>
                      {safeValue(preset.encoder)}
                    </TableCell>
                    <TableCell>
                      {preset.bitrate ? (
                        <Typography variant="body2">
                          {typeof preset.bitrate === 'string' ? preset.bitrate : `${preset.bitrate} kbps`}
                        </Typography>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      {preset.framerate ? `${preset.framerate} fps` : '—'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={safeValue(preset.status, 'active')} 
                        size="small" 
                        color={getStatusColor(preset.status)}
                      />
                    </TableCell>
                    <TableCell>
                      {preset.createdAt ? new Date(preset.createdAt).toLocaleDateString('ru-RU') : '—'}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="Редактировать">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditClick(preset)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(preset)}
                            disabled={preset.status === 'active'}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
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
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, presetId: null, presetName: '' })}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить пресет <strong>{deleteDialog.presetName}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, presetId: null, presetName: '' })}>
            Отмена
          </Button>
          <Button 
            onClick={handleDeletePreset} 
            color="error" 
            variant="contained"
            autoFocus
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      <CreatePresetModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handlePresetCreated}
      />

      {editingPreset && (
        <CreatePresetModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingPreset(null);
          }}
          onUpdated={handlePresetUpdated}
          preset={editingPreset}
        />
      )}
    </Box>
  );
};

export default PresetsPage;
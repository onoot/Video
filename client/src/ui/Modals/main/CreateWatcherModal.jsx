// client\src\ui\Modals\main\CreateWatcherModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  fetchPresets, 
  createWatcher,
  fetchFileSystem
} from '../../../http/dashboard';
import CustomDropdown from '../../../ui/buttons/DropdownForDetails';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

const CreateWatcherModal = ({ isOpen, onClose, onCreated }) => {
  const [watchDir, setWatchDir] = useState('');
  const [outputDir, setOutputDir] = useState('');
  const [preset, setPreset] = useState('');
  const [rules, setRules] = useState('');
  
  const [presets, setPresets] = useState([]);
  const [fileTree, setFileTree] = useState([]);
  const [expandedDirs, setExpandedDirs] = useState(new Set());
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Загружаем пресеты

      fetchPresets()
        .then(setPresets)
        .catch(err => {
          console.error('Не удалось загрузить пресеты:', err);
          setError('Не удалось загрузить пресеты');
        });

      // Загружаем файловую систему
      fetchFileSystem()
        .then(setFileTree)
        .catch(err => {
          console.error('Не удалось загрузить файловую систему:', err);
          setError('Не удалось загрузить структуру файлов');
        });

      // Сброс состояний
      setWatchDir('');
      setOutputDir('');
      setPreset('');
      setRules('');
      setExpandedDirs(new Set());
      setError('');
    }
  }, [isOpen]);

  // Обновление категории при смене пресета
  const [category, setCategory] = useState('');
  useEffect(() => {
    const p = presets.find(p => p.name === preset);
    setCategory(p?.category || '');
  }, [preset, presets]);

  // Рекурсивный рендер дерева
  const renderTree = (nodes, depth = 0, onSelect, selectedPath = '') => {
    return nodes.map((node) => {
      const isExpanded = expandedDirs.has(node.path);
      const isSelected = node.path === selectedPath;

      const toggleExpand = () => {
        const newSet = new Set(expandedDirs);
        if (newSet.has(node.path)) {
          newSet.delete(node.path);
        } else {
          newSet.add(node.path);
        }
        setExpandedDirs(newSet);
      };

      const handleClick = () => {
        if (node.isDirectory) {
          toggleExpand();
          onSelect(node.path);
        }
      };

      return (
        <React.Fragment key={node.path}>
          <ListItem
            button
            onClick={handleClick}
            selected={isSelected}
            sx={{
              pl: `${depth * 24 + 16}px`,
              bgcolor: isSelected ? 'primary.light' : 'transparent',
              '&.Mui-selected': {
                color: 'white',
                bgcolor: 'primary.main',
                '& .MuiListItemIcon-root': { color: 'white' },
              },
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <ListItemIcon>
              {node.isDirectory ? <FolderIcon /> : <InsertDriveFileIcon />}
            </ListItemIcon>
            <ListItemText primary={<Typography variant="body2" noWrap>{node.name}</Typography>} />
          </ListItem>
          {node.isDirectory && isExpanded && node.children && (
            <React.Fragment>
              {renderTree(node.children, depth + 1, onSelect, selectedPath)}
            </React.Fragment>
          )}
        </React.Fragment>
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация
    if (!watchDir) {
      setError('Пожалуйста, выберите директорию для наблюдения');
      return;
    }
    
    if (!outputDir) {
      setError('Пожалуйста, выберите выходную директорию');
      return;
    }
    
    if (!preset) {
      setError('Пожалуйста, выберите пресет');
      return;
    }

    setLoading(true);
    try {
      await createWatcher({ 
        watchDir, 
        outputDir, 
        preset, 
        rules: rules || undefined 
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Не удалось создать наблюдатель');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Преобразуем пресеты в формат для dropdown
  const presetOptions = presets.map(p => ({
    value: p.name,
    label: `${p.name} (${p.format})`
  }));

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5>Создать наблюдателя</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px' }}>
            {error && (
              <Box sx={{ mb: 2 }}>
                <Alert severity="error" onClose={() => setError('')}>
                  {error}
                </Alert>
              </Box>
            )}

            {/* === Выбор директорий === */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Выбор директорий
              </Typography>

              {/* Директория наблюдения */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <FolderOpenIcon color="primary" />
                  <Typography variant="subtitle2">
                    Директория наблюдения
                  </Typography>
                </Box>
                <Paper variant="outlined" sx={{ p: 1, maxHeight: 200, overflowY: 'auto' }}>
                  <List dense disablePadding>
                    {renderTree(fileTree, 0, (path) => {
                      setWatchDir(path);
                    }, watchDir)}
                  </List>
                </Paper>
                {watchDir && (
                  <Typography variant="caption" sx={{ mt: 1, color: 'primary.main' }}>
                    Выбрано: {watchDir}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Выходная директория */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <FolderIcon color="action" />
                  <Typography variant="subtitle2">
                    Выходная директория
                  </Typography>
                </Box>
                <Paper variant="outlined" sx={{ p: 1, maxHeight: 200, overflowY: 'auto' }}>
                  <List dense disablePadding>
                    {renderTree(fileTree, 0, (path) => {
                      setOutputDir(path);
                    }, outputDir)}
                  </List>
                </Paper>
                {outputDir && (
                  <Typography variant="caption" sx={{ mt: 1, color: 'primary.main' }}>
                    Выбрано: {outputDir}
                  </Typography>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* === Настройки обработки === */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Настройки обработки
              </Typography>

              {/* Выбор пресета */}
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Пресет</InputLabel>
                  <Select
                    value={preset}
                    onChange={(e) => setPreset(e.target.value)}
                    label="Пресет"
                    required
                  >
                    {presetOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Категория (только чтение) */}
                <TextField
                  fullWidth
                  label="Категория (только чтение)"
                  value={category}
                  InputProps={{ readOnly: true }}
                  size="small"
                  sx={{ mb: 2 }}
                  helperText="Категория пресета для справки"
                />
              </Box>

              {/* Правила фильтрации */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Правила фильтрации (опционально)
                </Typography>
                <TextField
                  fullWidth
                  label="Правила фильтрации файлов"
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  placeholder="*.mkv, *.mov, длительность < 60с, размер > 1МБ"
                  size="small"
                  multiline
                  rows={2}
                  helperText={
                    <span>
                      Примеры: <code>*.nkv</code>, <code>*.mov|*.avi</code>,{' '}
                      <code>размер &gt; 10МБ</code>, <code>длительность &lt; 300с</code>
                    </span>
                  }
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Сводка */}
            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Сводка
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Наблюдатель будет мониторить <strong>{watchDir || '[не выбрано]'}</strong> на наличие новых файлов,
                соответствующих правилам фильтрации, обрабатывать их с использованием пресета{' '}
                <strong>{preset || '[не выбран]'}</strong> и сохранять результаты в{' '}
                <strong>{outputDir || '[не выбрано]'}</strong>.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Примечание: Наблюдатель работает непрерывно в фоновом режиме до отключения.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Отмена
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading || !watchDir || !outputDir || !preset}
              >
                {loading ? 'Создание...' : 'Создать наблюдателя'}
              </button>
            </Box>
          </form>
        </div>
      </div>
      <div className="modal-backdrop show" style={{ zIndex: -1000 }}></div>
    </div>
  );
};

export default CreateWatcherModal;
// client/src/ui/Modals/main/CreateQueueModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  fetchFileSystem, 
  fetchPresets, 
  fetchRenameRules, 
  createQueueItem 
} from '../../../http/dashboard';
import CustomDropdown from '../../../ui/buttons/DropdownForDetails';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Paper,
  Divider,
  Button,
  Alert,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

const CreateQueueModal = ({ isOpen, onClose, onCreated }) => {
  const [mode, setMode] = useState('file');
  const [selectedInput, setSelectedInput] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedOutputDir, setSelectedOutputDir] = useState('output');
  const [fileExtension, setFileExtension] = useState('mkv');
  const [renameRule, setRenameRule] = useState('');
  const [customRenameTemplate, setCustomRenameTemplate] = useState('');
  const [preset, setPreset] = useState('');
  const [category, setCategory] = useState('');

  const [presets, setPresets] = useState([]);
  const [renameRules, setRenameRules] = useState([]);
  const [fileTree, setFileTree] = useState([]);
  const [expandedDirs, setExpandedDirs] = useState(new Set());
  const [folderFiles, setFolderFiles] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingRules, setLoadingRules] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('selectMode');

  useEffect(() => {
    if (isOpen) {
      fetchPresets().then(data => {
        setPresets(data);
        if (data.length > 0) {
          setPreset(data[0].name);
          setCategory(data[0].category);
        }
      }).catch(console.error);

      setLoadingRules(true);
      fetchRenameRules().then(data => {
        setRenameRules(data);
        if (data.length > 0) {
          const defaultRule = data.find(r => r.isDefault) || data[0];
          setRenameRule(defaultRule.value);
        }
      }).catch(err => {
        console.error('Ошибка загрузки правил переименования:', err);
        setError('Не удалось загрузить правила переименования');
      }).finally(() => {
        setLoadingRules(false);
      });

      fetchFileSystem().then(setFileTree).catch(err => {
        console.error('Ошибка загрузки файловой системы', err);
        setError('Не удалось загрузить файловую структуру');
      });

      setSelectedInput('');
      setSelectedFolder('');
      setSelectedFile('');
      setSelectedOutputDir('output');
      setFileExtension('mkv');
      setRenameRule('');
      setCustomRenameTemplate('');
      setMode('file');
      setStep('selectMode');
      setFolderFiles([]);
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    const p = presets.find(p => p.name === preset);
    setCategory(p?.category || '');
  }, [preset, presets]);

  const getFilesInFolder = (nodes, folderPath) => {
    let files = [];
    
    const findFolder = (items, path) => {
      for (const item of items) {
        if (item.path === path && item.isDirectory) {
          return item;
        }
        if (item.isDirectory && item.children) {
          const found = findFolder(item.children, path);
          if (found) return found;
        }
      }
      return null;
    };

    const folder = findFolder(nodes, folderPath);
    if (folder && folder.children) {
      const collectFiles = (items) => {
        for (const item of items) {
          if (!item.isDirectory) {
            files.push(item);
          }
          if (item.isDirectory && item.children) {
            collectFiles(item.children);
          }
        }
      };
      collectFiles(folder.children);
    }
    
    return files;
  };

  const handleFolderSelect = (folderPath) => {
    setSelectedFolder(folderPath);
    const files = getFilesInFolder(fileTree, folderPath);
    setFolderFiles(files);
    
    if (files.length === 0) {
      setError('Выбранная папка пуста');
      return;
    }
    
    setStep('selectFileInFolder');
    setError('');
  };

  const renderTree = (nodes, depth = 0, onSelect, selectedPath = '', filterType = 'all') => {
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
          if (filterType === 'output' || (filterType === 'input' && mode === 'folder' && step === 'selectMode')) {
            onSelect(node.path);
          }
        } else {
          if (filterType === 'input' && mode === 'file') {
            onSelect(node.path);
          }
        }
      };

      const isDisabled = 
        (filterType === 'input' && mode === 'file' && node.isDirectory) ||
        (filterType === 'input' && mode === 'folder' && !node.isDirectory && step === 'selectMode');

      return (
        <React.Fragment key={node.path}>
          <ListItem
            button
            onClick={handleClick}
            selected={isSelected}
            disabled={isDisabled}
            sx={{
              pl: `${depth * 24 + 16}px`,
              bgcolor: isSelected ? 'primary.light' : 'transparent',
              '&.Mui-selected': {
                color: 'white',
                bgcolor: 'primary.main',
                '& .MuiListItemIcon-root': { color: 'white' },
              },
              '&:hover': { bgcolor: !isDisabled ? 'action.hover' : 'transparent' },
              '&.Mui-disabled': { opacity: 0.5 },
            }}
          >
            <ListItemIcon>
              {node.isDirectory ? <FolderIcon /> : <InsertDriveFileIcon />}
            </ListItemIcon>
            <ListItemText primary={<Typography variant="body2" noWrap>{node.name}</Typography>} />
          </ListItem>
          {node.isDirectory && isExpanded && node.children && (
            <React.Fragment>
              {renderTree(node.children, depth + 1, onSelect, selectedPath, filterType)}
            </React.Fragment>
          )}
        </React.Fragment>
      );
    });
  };

  const renderFolderFiles = () => {
    return folderFiles.map((file) => (
      <ListItem
        key={file.path}
        button
        onClick={() => {
          setSelectedFile(file.path);
          setSelectedInput(file.path);
        }}
        selected={selectedFile === file.path}
        sx={{
          pl: 3,
          bgcolor: selectedFile === file.path ? 'primary.light' : 'transparent',
          '&.Mui-selected': {
            color: 'white',
            bgcolor: 'primary.main',
            '& .MuiListItemIcon-root': { color: 'white' },
          },
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <ListItemIcon>
          <InsertDriveFileIcon />
        </ListItemIcon>
        <ListItemText 
          primary={<Typography variant="body2" noWrap>{file.name}</Typography>}
          secondary={<Typography variant="caption" color="text.secondary">{file.path}</Typography>}
        />
      </ListItem>
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (mode === 'file' && !selectedInput) {
      setError('Выберите файл');
      return;
    }
    
    if (mode === 'folder' && (!selectedFolder || !selectedFile)) {
      setError('Выберите папку и файл');
      return;
    }
    
    if (!selectedOutputDir || !preset) {
      setError('Все обязательные поля должны быть заполнены');
      return;
    }

    setLoading(true);
    try {
      let outputPath = selectedOutputDir;
      if (fileExtension) {
        outputPath = outputPath.endsWith('.') ? outputPath + fileExtension : outputPath + '.' + fileExtension;
      }

      let finalRenameRule = null;
      if (renameRule === 'custom' && customRenameTemplate) {
        finalRenameRule = customRenameTemplate;
      } else if (renameRule && renameRule !== 'custom') {
        finalRenameRule = renameRule;
      }

      await createQueueItem({
        inputPath: selectedInput,
        inputMode: mode,
        outputPath,
        outputMode: 'file',
        preset,
        renameRule: finalRenameRule,
      });

      onCreated();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Не удалось создать задачу');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renameOptions = renameRules.map(rule => ({
    value: rule.value,
    label: `${rule.name} - ${rule.description}`,
    example: rule.example,
    pattern: rule.pattern
  }));

  const allRenameOptions = [
    ...renameOptions,
    { value: 'custom', label: 'Пользовательский шаблон (введите ниже)' }
  ];

  const presetOptions = presets.map(p => ({
    value: p.name,
    label: `${p.name} (${p.format})`
  }));

  const selectedRule = renameRules.find(r => r.value === renameRule);

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1050}}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5>Создание новой задачи</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px' }}>
            {error && (
              <Box sx={{ mb: 2 }}>
                <Typography color="error" variant="body2">{error}</Typography>
              </Box>
            )}

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Режим работы
              </Typography>
              <Tabs
                value={mode}
                onChange={(e, v) => {
                  setMode(v);
                  setSelectedInput('');
                  setSelectedFolder('');
                  setSelectedFile('');
                  setStep('selectMode');
                  setFolderFiles([]);
                  setError('');
                }}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="Один файл" value="file" />
                <Tab label="Файлы в папке" value="folder" />
              </Tabs>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                {mode === 'file' 
                  ? 'Выберите один файл для обработки' 
                  : 'Сначала выберите папку, затем файл внутри нее'}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              {mode === 'file' ? (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Выберите входной файл
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1, maxHeight: 200, overflowY: 'auto' }}>
                    <List dense disablePadding>
                      {renderTree(fileTree, 0, (path) => {
                        setSelectedInput(path);
                        setError('');
                      }, selectedInput, 'input')}
                    </List>
                  </Paper>
                  {selectedInput && (
                    <Typography variant="caption" sx={{ mt: 1, color: 'primary.main' }}>
                      Выбранный файл: {selectedInput}
                    </Typography>
                  )}
                </>
              ) : (
                <>
                  {step === 'selectMode' ? (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <FolderOpenIcon color="primary" />
                        <Typography variant="subtitle2">
                          Шаг 1: Выберите папку
                        </Typography>
                      </Box>
                      <Paper variant="outlined" sx={{ p: 1, maxHeight: 200, overflowY: 'auto' }}>
                        <List dense disablePadding>
                          {renderTree(fileTree, 0, handleFolderSelect, selectedFolder, 'input')}
                        </List>
                      </Paper>
                      {selectedFolder && (
                        <Typography variant="caption" sx={{ mt: 1, color: 'primary.main' }}>
                          Выбранная папка: {selectedFolder}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Button
                          startIcon={<ArrowBackIcon />}
                          size="small"
                          onClick={() => {
                            setStep('selectMode');
                            setSelectedFile('');
                            setSelectedInput('');
                          }}
                        >
                          Назад к выбору папки
                        </Button>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <FolderIcon color="action" />
                        <Typography variant="subtitle2">
                          Шаг 2: Выберите файл в "{selectedFolder.split('/').pop() || selectedFolder}"
                        </Typography>
                      </Box>
                      {folderFiles.length === 0 ? (
                        <Alert severity="warning">
                          Файлы не найдены в выбранной папке
                        </Alert>
                      ) : (
                        <>
                          <Paper variant="outlined" sx={{ p: 1, maxHeight: 200, overflowY: 'auto' }}>
                            <List dense disablePadding>
                              {renderFolderFiles()}
                            </List>
                          </Paper>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                            Найдено {folderFiles.length} файл(ов) в папке
                          </Typography>
                        </>
                      )}
                      {selectedFile && (
                        <Typography variant="caption" sx={{ mt: 1, color: 'primary.main' }}>
                          Выбранный файл: {selectedFile}
                        </Typography>
                      )}
                    </>
                  )}
                </>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Выберите выходную папку
              </Typography>

              <Paper variant="outlined" sx={{ p: 1, maxHeight: 200, overflowY: 'auto', mb: 2 }}>
                <List dense disablePadding>
                  {renderTree(fileTree, 0, (path) => {
                    setSelectedOutputDir(path);
                  }, selectedOutputDir, 'output')}
                </List>
              </Paper>

              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <TextField
                  label="Расширение файла"
                  value={fileExtension}
                  onChange={(e) => setFileExtension(e.target.value.replace('.', ''))}
                  size="small"
                  sx={{ width: 140 }}
                  helperText="Формат выходного файла"
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Пресет</InputLabel>
                <Select
                  value={preset}
                  onChange={(e) => setPreset(e.target.value)}
                  label="Пресет"
                >
                  {presetOptions.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Категория (только чтение)"
                value={category}
                InputProps={{ readOnly: true }}
                size="small"
                sx={{ mb: 2 }}
              />
                <InputLabel>Правило переименования</InputLabel>

              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <CustomDropdown
                  options={allRenameOptions}
                  value={renameRule}
                  onChange={(value) => {
                    setRenameRule(value);
                    if (value !== 'custom') {
                      setCustomRenameTemplate('');
                    }
                  }}
                  placeholder={loadingRules ? "Загрузка правил..." : "Выберите правило"}
                  disabled={loadingRules}
                />
              </FormControl>

              {selectedRule && selectedRule.example && renameRule !== 'custom' && (
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Пример: {selectedRule.example}
                </Typography>
              )}

              {renameRule === 'custom' && (
                <TextField
                  fullWidth
                  label="Пользовательский шаблон"
                  placeholder="например: {project}_{YYYYMMDD}_{counter:02d}"
                  value={customRenameTemplate}
                  onChange={(e) => setCustomRenameTemplate(e.target.value)}
                  size="small"
                  sx={{ mt: 1 }}
                  helperText={
                    <span>
                      Доступные переменные: {'{original}'}, {'{YYYYMMDD}'}, {'{HHMMSS}'}, 
                      {'{counter:XXd}'} (XX = цифры), {'{project}'}, {'{title}'}
                    </span>
                  }
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Отмена
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Создание...' : 'Создать задачу'}
              </button>
            </Box>
          </form>
        </div>
      </div>
      <div className="modal-backdrop show" style={{ zIndex: -1000 }}></div>
    </div>
  );
};

export default CreateQueueModal;
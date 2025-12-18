import React, { useState, useEffect } from 'react';
import { useNotification, useStorage } from '../../contex/index';
import { 
  fetchSettings,
  updateSettings as updateSettingsAPI,
  resetSettings,
  fetchFileSystem
} from '../../http/dashboard';
import {changePAssword, changeLogin} from '../../http/auth_user';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  ListItemButton,
  Collapse,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Restore as RestoreIcon,
  Folder as FolderIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Lock as LockIcon,
  AccountCircle as AccountIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Visibility,
  VisibilityOff,
  Check as CheckIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  InsertDriveFile as FileIcon,
  ExpandMore,
  ChevronRight,
  ArrowBack,
} from '@mui/icons-material';

const Settings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [passwordDialog, setPasswordDialog] = useState({
    open: false,
    old: '',
    pass: '',
    confirm_pass: '',
    showOld: false,
    showPass: false,
    showConfirmPass: false,
  });
  
  const [loginData, setLoginData] = useState({
    old: '',
    login: '',
    pass: '',
    showPass: false,
    showSaveButton: false,
    isSaving: false,
  });
  
  const [resetDialog, setResetDialog] = useState({
    open: false,
    category: null,
  });

  const [pathSelectorDialog, setPathSelectorDialog] = useState({
    open: false,
    settingKey: '',
    currentPath: '',
    fileTree: [],
    expandedDirs: new Set(),
  });
  
  const { showNotification } = useNotification();
  const { user, setUser } = useStorage();

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await fetchSettings();
      
      const grouped = {};
      data.forEach(setting => {
        if (!grouped[setting.category]) {
          grouped[setting.category] = [];
        }
        grouped[setting.category].push(setting);
      });
      setLoginData({
        login: user?.login||''
      })
      
      setSettings(grouped);
      setError('');
    } catch (err) {
      setError('Не удалось загрузить настройки');
      console.error('Ошибка загрузки настроек:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings };
    Object.keys(newSettings).forEach(category => {
      newSettings[category] = newSettings[category].map(setting => {
        if (setting.key === key) {
          return { ...setting, value };
        }
        return setting;
      });
    });
    setSettings(newSettings);
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    
    try {
      const updates = {};
      Object.values(settings).flat().forEach(setting => {
        updates[setting.key] = setting.value;
      });
      
      await updateSettingsAPI(updates);
      setSuccess('Настройки успешно сохранены');
      showNotification('success', 'Настройки успешно сохранены');
    } catch (err) {
      setError('Не удалось сохранить настройки');
      showNotification('error', 'Не удалось сохранить настройки');
      console.error('Ошибка сохранения настроек:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      await resetSettings(resetDialog.category ? { category: resetDialog.category } : {});
      const mess = `${resetDialog.category || 'все'}`;
      setSuccess(`Настройки ${mess} сброшены`);
      showNotification('success', `Настройки ${mess} сброшены`);
      loadSettings();
      setResetDialog({ open: false, category: null });
    } catch (err) {
      setError('Не удалось сбросить настройки');
      showNotification('error', 'Не удалось сбросить настройки');
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (passwordDialog.pass !== passwordDialog.confirm_pass) {
        showNotification('error', 'Новые пароли не совпадают');
        return;
      }
      
      if (!passwordDialog.old || !passwordDialog.pass) {
        showNotification('error', 'Заполните все поля');
        return;
      }
      
      if (passwordDialog.pass.length < 8) {
        showNotification('error', 'Новый пароль должен содержать минимум 8 символов');
        return;
      }
      
      const result = await changePAssword(
        user?.login,
        passwordDialog.old,
        passwordDialog.pass,
        passwordDialog.confirm_pass
      );
      
      if (result) {
        showNotification('success', 'Пароль успешно изменен');
        setPasswordDialog({
          open: false,
          old: '',
          pass: '',
          confirm_pass: '',
          showOld: false,
          showPass: false,
          showConfirmPass: false,
        });
        setSuccess('Пароль успешно изменен');
      } else {
        showNotification('error', 'Не удалось изменить пароль');
      }
    } catch (err) {
      showNotification('error', 'Ошибка при изменении пароля');
      console.error('Ошибка смены пароля:', err);
    }
  };

  const handleLoginChange = async () => {
    try {
      if (!loginData.pass || !loginData.login) {
        showNotification('error', 'Заполните все поля');
        return;
      }
      
      if (loginData.login === user?.login) {
        showNotification('info', 'Логин не изменился');
        cancelLoginChange();
        return;
      }
      
      setLoginData(prev => ({ ...prev, isSaving: true }));
      
      const result = await changeLogin(
        user?.login,
        loginData.login,
        loginData.pass
      );
      
      if (result) {
        setUser({
          ...user,
          login: loginData.login,
        });
        
        showNotification('success', 'Логин успешно изменен');
        setSuccess('Логин успешно изменен');
        setLoginData({
          old: '',
          login: loginData.login,
          pass: '',
          showPass: false,
          showSaveButton: false,
          isSaving: false,
        });
      } else {
        showNotification('error', 'Не удалось изменить логин. Проверьте пароль.');
      }
    } catch (err) {
      showNotification('error', 'Ошибка при изменении логина');
      console.error('Ошибка смены логина:', err);
    } finally {
      setLoginData(prev => ({ ...prev, isSaving: false }));
    }
  };

  const handleNewLoginChange = (e) => {
    const newLogin = e.target.value;
    const showSaveButton = newLogin !== user?.login && newLogin.length > 0;
    
    setLoginData(prev => ({
      ...prev,
      login: newLogin,
      showSaveButton,
    }));
  };

  const handleLoginPasswordChange = (e) => {
    setLoginData(prev => ({
      ...prev,
      pass: e.target.value,
    }));
  };

  const cancelLoginChange = () => {
    setLoginData({
      old: '',
      login: user?.login || '',
      pass: '',
      showPass: false,
      showSaveButton: false,
      isSaving: false,
    });
  };

  const togglePasswordVisibility = (field) => {
    setPasswordDialog(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const toggleLoginPasswordVisibility = () => {
    setLoginData(prev => ({
      ...prev,
      showPass: !prev.showPass
    }));
  };

  const openPathSelector = async (settingKey, currentPath) => {
    try {
      const fileTree = await fetchFileSystem();
      setPathSelectorDialog({
        open: true,
        settingKey,
        currentPath,
        fileTree,
        expandedDirs: new Set(),
      });
    } catch (err) {
      console.error('Ошибка загрузки файловой структуры:', err);
      showNotification('error', 'Не удалось загрузить файловую структуру');
    }
  };

  const handlePathSelect = (path) => {
    handleSettingChange(pathSelectorDialog.settingKey, path);
    setPathSelectorDialog(prev => ({ ...prev, open: false }));
  };

  const toggleDirExpansion = (dirPath) => {
    const newSet = new Set(pathSelectorDialog.expandedDirs);
    if (newSet.has(dirPath)) {
      newSet.delete(dirPath);
    } else {
      newSet.add(dirPath);
    }
    setPathSelectorDialog(prev => ({
      ...prev,
      expandedDirs: newSet,
    }));
  };

  const renderPathTree = (nodes, depth = 0) => {
    return nodes.map((node) => {
      const isExpanded = pathSelectorDialog.expandedDirs.has(node.path);
      const isSelected = pathSelectorDialog.currentPath === node.path;

      if (!node.isDirectory) return null;

      return (
        <React.Fragment key={node.path}>
          <ListItemButton
            onClick={() => {
              if (isExpanded) {
                toggleDirExpansion(node.path);
              } else {
                toggleDirExpansion(node.path);
              }
            }}
            selected={isSelected}
            sx={{
              pl: depth * 4 + 2,
              bgcolor: isSelected ? 'primary.light' : 'transparent',
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              {isExpanded ? <ExpandMore /> : <ChevronRight />}
            </ListItemIcon>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <FolderIcon />
            </ListItemIcon>
            <ListItemText 
              primary={node.name}
              secondary={node.path}
            />
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation();
                handlePathSelect(node.path);
              }}
              sx={{ ml: 1 }}
            >
              Выбрать
            </Button>
          </ListItemButton>
          {node.isDirectory && isExpanded && node.children && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderPathTree(node.children, depth + 1)}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      );
    });
  };

  const renderSettingField = (setting) => {
    const commonProps = {
      fullWidth: true,
      size: 'small',
      label: setting.description,
      value: setting.value || '',
      onChange: (e) => handleSettingChange(setting.key, e.target.value),
      disabled: !setting.editable,
      helperText: `Ключ: ${setting.key}`,
    };

    switch (setting.type) {
      case 'number':
        return (
          <TextField
            {...commonProps}
            type="number"
            InputProps={{ inputProps: { min: 0 } }}
          />
        );
        
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={setting.value === 'true'}
                onChange={(e) => handleSettingChange(setting.key, e.target.checked.toString())}
                disabled={!setting.editable}
              />
            }
            label={setting.description}
          />
        );
        
      case 'path':
        return (
          <TextField
            {...commonProps}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FolderIcon sx={{ mr: 1, color: 'action.active' }} />
                </InputAdornment>
              ),
              endAdornment: setting.editable && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => openPathSelector(setting.key, setting.value)}
                  >
                    <EditIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        );
        
      default:
        return <TextField {...commonProps} />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'folders': return <FolderIcon />;
      case 'intervals': return <ScheduleIcon />;
      case 'limits': return <SettingsIcon />;
      case 'notifications': return <NotificationsIcon />;
      case 'security': return <SecurityIcon />;
      default: return <SettingsIcon />;
    }
  };

  const getCategoryTitle = (category) => {
    const titles = {
      folders: 'Папки',
      intervals: 'Интервалы',
      limits: 'Ограничения',
    };
    return titles[category] || category;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            Настройки системы
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadSettings}
            >
              Обновить
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {Object.entries(settings).map(([category, categorySettings]) => (
            <Grid item xs={12} key={category}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getCategoryIcon(category)}
                      <Typography variant="h6" fontWeight="medium">
                        {getCategoryTitle(category)}
                      </Typography>
                    </Box>
                    <Tooltip title="Сбросить настройки категории">
                      <IconButton
                        size="small"
                        onClick={() => setResetDialog({ open: true, category })}
                        disabled={!categorySettings.some(s => s.editable)}
                      >
                        <RestoreIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    {categorySettings.map((setting) => (
                      <Grid item xs={12} sm={6} md={4} key={setting.key}>
                        {renderSettingField(setting)}
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountIcon />
              Настройки учетной записи
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom color="text.secondary">
                  Смена логина
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <TextField
                    fullWidth
                    value={loginData.login}
                    onChange={handleNewLoginChange}
                    placeholder="Введите новый логин"
                    helperText={loginData.showSaveButton ? "Для сохранения введите пароль ниже" : `Текущий логин: ${user?.login}`}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: loginData.showSaveButton && (
                        <InputAdornment position="end">
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Сохранить">
                              <IconButton
                                size="small"
                                onClick={handleLoginChange}
                                disabled={loginData.isSaving || !loginData.pass}
                                color="primary"
                              >
                                {loginData.isSaving ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <CheckIcon />
                                )}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Отменить">
                              <IconButton
                                size="small"
                                onClick={cancelLoginChange}
                                color="inherit"
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                
                {loginData.showSaveButton && (
                  <TextField
                    fullWidth
                    sx={{ mt: 2 }}
                    type={loginData.showPass ? "text" : "password"}
                    label="Пароль"
                    value={loginData.pass}
                    onChange={handleLoginPasswordChange}
                    helperText="Введите пароль для подтверждения"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={toggleLoginPasswordVisibility}
                            edge="end"
                          >
                            {loginData.showPass ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              </Grid>

              <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<LockIcon />}
                  onClick={() => setPasswordDialog({ ...passwordDialog, open: true })}
                  sx={{ height: '56px' }}
                >
                  Изменить пароль
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Paper>

      <Dialog
        open={resetDialog.open}
        onClose={() => setResetDialog({ open: false, category: null })}
      >
        <DialogTitle>Подтверждение сброса</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите сбросить {resetDialog.category ? 'настройки категории' : 'все настройки'} к значениям по умолчанию?
          </DialogContentText>
          <DialogContentText variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Это действие нельзя отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialog({ open: false, category: null })}>
            Отмена
          </Button>
          <Button onClick={handleReset} color="warning" autoFocus>
            Сбросить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={passwordDialog.open}
        onClose={() => setPasswordDialog({ ...passwordDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Изменение пароля</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                type={passwordDialog.showOld ? "text" : "password"}
                label="Старый пароль"
                value={passwordDialog.old}
                onChange={(e) => setPasswordDialog({ ...passwordDialog, old: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('showOld')}
                        edge="end"
                      >
                        {passwordDialog.showOld ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                type={passwordDialog.showPass ? "text" : "password"}
                label="Новый пароль"
                value={passwordDialog.pass}
                onChange={(e) => setPasswordDialog({ ...passwordDialog, pass: e.target.value })}
                helperText="Минимум 8 символов"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('showPass')}
                        edge="end"
                      >
                        {passwordDialog.showPass ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                type={passwordDialog.showConfirmPass ? "text" : "password"}
                label="Подтверждение пароля"
                value={passwordDialog.confirm_pass}
                onChange={(e) => setPasswordDialog({ ...passwordDialog, confirm_pass: e.target.value })}
                error={passwordDialog.pass !== passwordDialog.confirm_pass}
                helperText={
                  passwordDialog.pass !== passwordDialog.confirm_pass 
                    ? 'Пароли не совпадают' 
                    : 'Повторите новый пароль'
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('showConfirmPass')}
                        edge="end"
                      >
                        {passwordDialog.showConfirmPass ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog({ 
            ...passwordDialog, 
            open: false,
            old: '',
            pass: '',
            confirm_pass: '',
          })}>
            Отмена
          </Button>
          <Button 
            onClick={handlePasswordChange} 
            variant="contained"
            disabled={
              !passwordDialog.old || 
              !passwordDialog.pass || 
              !passwordDialog.confirm_pass ||
              passwordDialog.pass !== passwordDialog.confirm_pass ||
              passwordDialog.pass.length < 8
            }
          >
            Изменить пароль
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={pathSelectorDialog.open}
        onClose={() => setPathSelectorDialog(prev => ({ ...prev, open: false }))}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Выбор папки</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Выберите папку из файловой системы
            </Typography>
          </Box>
          <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
            <List dense disablePadding>
              {renderPathTree(pathSelectorDialog.fileTree)}
            </List>
          </Paper>
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Текущий путь: {pathSelectorDialog.currentPath || 'Не выбран'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPathSelectorDialog(prev => ({ ...prev, open: false }))}>
            Отмена
          </Button>
          <Button 
            onClick={() => handlePathSelect(pathSelectorDialog.currentPath)}
            variant="contained"
            disabled={!pathSelectorDialog.currentPath}
          >
            Выбрать текущий путь
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
// client\src\ui\Modals\main\PresetModal.jsx
import React, { useState, useEffect } from 'react';
import { createPreset, updatePreset } from '../../../http/dashboard';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Divider,
  Alert,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Chip,
  Stack,
  Switch,
} from '@mui/material';

const PresetModal = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  mode = 'create',
  preset = null 
}) => {
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    format: 'MKV',
    resolution: '1920x1080 (Full HD)',
    encoder: 'H.264',
    bitrate: 8000,
    framerate: 30,
    audioCodec: 'AAC',
    audioBitrate: 192,
    optimizeForWeb: true,
    twoPassEncoding: false,
    deinterlace: false,
    description: '',
    status: 'active'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatOptions = ['MP4', 'MOV', 'AVI', 'MKV', 'WEBM', 'FLV', 'MPEG'];
  const encoderOptions = [
    'H.264',
    'H.265 (HEVC)',
    'VP9',
    'AV1',
    'ProRes 422',
    'ProRes 4444',
    'DNxHD',
    'MJPEG'
  ];
  const resolutionOptions = [
    '3840x2160 (4K UHD)',
    '2560x1440 (2K QHD)',
    '1920x1080 (Full HD)',
    '1280x720 (HD)',
    '854x480 (SD)',
    '640x360 (nHD)'
  ];
  const audioCodecOptions = ['AAC', 'MP3', 'AC3', 'Opus', 'PCM', 'Vorbis'];
  const categoryOptions = ['Экспорт', 'Архив', 'Веб', 'Мобильные устройства', 'Промежуточный', 'Мастер-копия'];
  const statusOptions = [
    { value: 'active', label: 'Активный' },
    { value: 'inactive', label: 'Неактивный' },
    { value: 'draft', label: 'Черновик' }
  ];

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && preset) {
        const parseBitrate = (bitrate) => {
          if (!bitrate) return 8000;
          if (typeof bitrate === 'number') return bitrate;
          const match = bitrate.match(/(\d+)/);
          return match ? parseInt(match[1]) : 8000;
        };

        setFormData({
          category: preset.category || '',
          name: preset.name || '',
          format: preset.format || 'MKV',
          resolution: preset.resolution ? 
            `${preset.resolution} (${getResolutionLabel(preset.resolution)})` : 
            '1920x1080 (Full HD)',
          encoder: preset.encoder || 'H.264',
          bitrate: parseBitrate(preset.bitrate),
          framerate: preset.framerate || 30,
          audioCodec: preset.audioCodec || 'AAC',
          audioBitrate: parseBitrate(preset.audioBitrate),
          optimizeForWeb: preset.optimizeForWeb !== false,
          twoPassEncoding: preset.twoPassEncoding || false,
          deinterlace: preset.deinterlace || false,
          description: preset.description || '',
          status: preset.status || 'active'
        });
      } else {
        setFormData({
          category: '',
          name: '',
          format: 'MKV',
          resolution: '1920x1080 (Full HD)',
          encoder: 'H.264',
          bitrate: 8000,
          framerate: 30,
          audioCodec: 'AAC',
          audioBitrate: 192,
          optimizeForWeb: true,
          twoPassEncoding: false,
          deinterlace: false,
          description: '',
          status: 'active'
        });
      }
      setError('');
    }
  }, [isOpen, mode, preset]);

  const getResolutionLabel = (resolution) => {
    const map = {
      '3840x2160': '4K UHD',
      '2560x1440': '2K QHD',
      '1920x1080': 'Full HD',
      '1280x720': 'HD',
      '854x480': 'SD',
      '640x360': 'nHD'
    };
    return map[resolution] || resolution;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const requiredFields = ['category', 'name', 'format', 'resolution', 'encoder'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setError('Все обязательные поля должны быть заполнены');
      return;
    }

    setLoading(true);
    try {
      const presetData = {
        category: formData.category,
        name: formData.name,
        format: formData.format,
        resolution: formData.resolution.split(' ')[0], 
        encoder: formData.encoder,
        bitrate: `${formData.bitrate}k`,
        framerate: formData.framerate,
        audioCodec: formData.audioCodec,
        audioBitrate: `${formData.audioBitrate}k`,
        optimizeForWeb: formData.optimizeForWeb,
        twoPassEncoding: formData.twoPassEncoding,
        deinterlace: formData.deinterlace,
        description: formData.description || undefined,
        status: formData.status
      };

      if (mode === 'create') {
        await createPreset(presetData);
      } else if (mode === 'edit' && preset) {
        await updatePreset(preset.id, presetData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 
        `Не удалось ${mode === 'create' ? 'создать' : 'обновить'} пресет`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateFileSize = () => {
    const resolutionPart = formData.resolution.split(' ')[0];
    const [width, height] = resolutionPart.split('x').map(Number);
    const duration = 60; 
    const videoBitrateKbps = formData.bitrate;
    const audioBitrateKbps = formData.audioBitrate;
    const totalBitrateKbps = videoBitrateKbps + audioBitrateKbps;
    
    const sizeMB = (totalBitrateKbps * duration) / (8 * 1000);
    return sizeMB.toFixed(1);
  };

  if (!isOpen) return null;

  const isEditMode = mode === 'edit';
  const title = isEditMode ? `Редактирование пресета: ${preset?.name}` : 'Создание нового пресета обработки видео';
  const submitButtonText = isEditMode 
    ? (loading ? 'Сохранение...' : 'Сохранить изменения') 
    : (loading ? 'Создание...' : 'Создать пресет');

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5>{title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px' }}>
            <div className="modal-body">
              {error && (
                <Box sx={{ mb: 3 }}>
                  <Alert severity="error" onClose={() => setError('')}>
                    {error}
                  </Alert>
                </Box>
              )}

              {/* === Основная информация === */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Основная информация
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Категория *</InputLabel>
                      <Select
                        value={formData.category}
                        onChange={(e) => handleChange('category', e.target.value)}
                        label="Категория *"
                        required
                      >
                        {categoryOptions.map((cat) => (
                          <MenuItem key={cat} value={cat}>
                            {cat}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      label="Название пресета *"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Быстрый Full HD"
                      sx={{ mb: 2 }}
                      required
                    />

                    <TextField
                      fullWidth
                      label="Описание (опционально)"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Краткое описание назначения пресета"
                      multiline
                      rows={2}
                    />
                  </Grid>

                  <Grid item xs={12} md={6} width={'100%'}>
                    <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Предварительный расчет:
                      </Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Видео битрейт:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {formData.bitrate} кбит/с
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Аудио битрейт:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {formData.audioBitrate} кбит/с
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Кадров в секунду:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {formData.framerate} fps
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Размер файла (1 минута):
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {calculateFileSize()} MB
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    {/* Статус только для редактирования */}
                    {isEditMode && (
                      <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Статус</InputLabel>
                        <Select
                          value={formData.status}
                          onChange={(e) => handleChange('status', e.target.value)}
                          label="Статус"
                        >
                          {statusOptions.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Grid>
                </Grid>
              </Paper>

              <Divider sx={{ my: 3 }} />

              {/* === Видео настройки === */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Настройки видео
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Формат *</InputLabel>
                      <Select
                        value={formData.format}
                        onChange={(e) => handleChange('format', e.target.value)}
                        label="Формат *"
                        required
                      >
                        {formatOptions.map((fmt) => (
                          <MenuItem key={fmt} value={fmt}>
                            {fmt}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Разрешение *</InputLabel>
                      <Select
                        value={formData.resolution}
                        onChange={(e) => handleChange('resolution', e.target.value)}
                        label="Разрешение *"
                        required
                      >
                        {resolutionOptions.map((res) => (
                          <MenuItem key={res} value={res}>
                            {res}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Кодек *</InputLabel>
                      <Select
                        value={formData.encoder}
                        onChange={(e) => handleChange('encoder', e.target.value)}
                        label="Кодек *"
                        required
                      >
                        {encoderOptions.map((enc) => (
                          <MenuItem key={enc} value={enc}>
                            {enc}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <FormGroup row sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.twoPassEncoding}
                        onChange={(e) => handleChange('twoPassEncoding', e.target.checked)}
                      />
                    }
                    label="Двухпроходное кодирование (высокое качество)"
                  />
                  
                </FormGroup>
              </Paper>

              <Divider sx={{ my: 3 }} />

              <Divider sx={{ my: 3 }} />

              {/* === Сводка === */}
              <Paper sx={{ p: 3, mb: 3, bgcolor: 'light', borderColor: 'info.main' }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Сводка пресета
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" paragraph>
                      <strong>Категория:</strong> {formData.category || '—'}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Название:</strong> {formData.name || '—'}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Формат:</strong> {formData.format}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Разрешение:</strong> {formData.resolution.split(' ')[0]}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Кодек:</strong> {formData.encoder}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" paragraph>
                      <strong>Видео битрейт:</strong> {formData.bitrate} кбит/с
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Частота кадров:</strong> {formData.framerate} fps
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Аудио кодек:</strong> {formData.audioCodec}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Аудио битрейт:</strong> {formData.audioBitrate} кбит/с
                    </Typography>
                    <Typography variant="body2">
                      <strong>Размер файла (1 мин):</strong> {calculateFileSize()} MB
                    </Typography>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary">
                    * Обязательные поля
                  </Typography>
                </Box>
              </Paper>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Отмена
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading || !formData.category || !formData.name}
              >
                {submitButtonText}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop show" style={{ zIndex: -1000 }}></div>
    </div>
  );
};

export default PresetModal;
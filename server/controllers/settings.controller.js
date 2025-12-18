// controllers/settings.controller.js
const { Settings } = require('../models');

const defaultSettings = {
  // Папки
  'media_path': {
    value: process.env.BASE_MEDIA_PATH || '/media',
    type: 'path',
    category: 'folders',
    description: 'Основная папка с медиафайлами'
  },
  'default_input_path': {
    value: '/input',
    type: 'path',
    category: 'folders',
    description: 'Папка по умолчанию для входных файлов'
  },
  'default_output_path': {
    value: '/output',
    type: 'path',
    category: 'folders',
    description: 'Папка по умолчанию для выходных файлов'
  },
  
  // Частоты проверок
  'watcher_check_interval': {
    value: '30',
    type: 'number',
    category: 'intervals',
    description: 'Интервал проверки наблюдателей (секунды)'
  },
  'queue_check_interval': {
    value: '10',
    type: 'number',
    category: 'intervals',
    description: 'Интервал проверки очереди (секунды)'
  },
  'cleanup_interval': {
    value: '3600',
    type: 'number',
    category: 'intervals',
    description: 'Интервал очистки временных файлов (секунды)'
  },
  
  // Ограничения
  'max_concurrent_tasks': {
    value: '3',
    type: 'number',
    category: 'limits',
    description: 'Максимальное количество одновременных задач'
  },
  'max_file_size': {
    value: '2147483648',
    type: 'number',
    category: 'limits',
    description: 'Максимальный размер файла (байты)'
  },
  'retry_attempts': {
    value: '3',
    type: 'number',
    category: 'limits',
    description: 'Количество повторных попыток при ошибке'
  },
  
  // Уведомления
  'enable_email_notifications': {
    value: 'false',
    type: 'boolean',
    category: 'notifications',
    description: 'Включить email уведомления'
  },
  'enable_system_notifications': {
    value: 'true',
    type: 'boolean',
    category: 'notifications',
    description: 'Включить системные уведомления'
  },
  
  // Безопасность
  'session_timeout': {
    value: '3600',
    type: 'number',
    category: 'security',
    description: 'Таймаут сессии (секунды)'
  },
  'password_min_length': {
    value: '8',
    type: 'number',
    category: 'security',
    description: 'Минимальная длина пароля'
  },
  'enable_two_factor': {
    value: 'false',
    type: 'boolean',
    category: 'security',
    description: 'Включить двухфакторную аутентификацию'
  }
};

const initializeSettings = async () => {
  for (const [key, config] of Object.entries(defaultSettings)) {
    const existing = await Settings.findOne({ where: { key } });
    if (!existing) {
      await Settings.create({
        key,
        value: config.value,
        type: config.type,
        category: config.category,
        description: config.description
      });
    }
  }
};

const getSettings = async (req, res) => {
  try {
    const settings = await Settings.findAll({
      order: [['category', 'ASC'], ['key', 'ASC']]
    });
    res.json(settings);
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ message: 'Failed to load settings' });
  }
};

const getSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Settings.findOne({ where: { key } });
    
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }
    
    res.json(setting);
  } catch (err) {
    console.error('Get setting error:', err);
    res.status(500).json({ message: 'Failed to load setting' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    const results = [];
    
    for (const [key, value] of Object.entries(updates)) {
      const setting = await Settings.findOne({ where: { key } });
      
      if (setting && setting.editable) {
        await setting.update({ value: Settings.stringifyValue(value, setting.type) });
        results.push({ key, success: true });
      } else {
        results.push({ key, success: false, message: 'Setting not found or not editable' });
      }
    }
    
    res.json({ 
      message: 'Settings updated',
      results 
    });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ message: 'Failed to update settings' });
  }
};

const resetToDefault = async (req, res) => {
  try {
    const { category } = req.body;
    
    for (const [key, config] of Object.entries(defaultSettings)) {
      if (!category || config.category === category) {
        const setting = await Settings.findOne({ where: { key } });
        if (setting && setting.editable) {
          await setting.update({ value: config.value });
        }
      }
    }
    
    res.json({ 
      message: category ? `${category} settings reset to default` : 'All settings reset to default'
    });
  } catch (err) {
    console.error('Reset settings error:', err);
    res.status(500).json({ message: 'Failed to reset settings' });
  }
};

module.exports = {
  initializeSettings,
  getSettings,
  getSettingByKey,
  updateSettings,
  resetToDefault
};
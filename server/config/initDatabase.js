// config/initDatabase.js
const sequelize = require('./database');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Category = require('../models/Category');
const Preset = require('../models/Preset');
const RenameRule = require('../models/RenameRule');
const Watcher = require('../models/Watcher');
const Task = require('../models/Task');
const TaskHistory = require('../models/TaskHistory');
const Settings = require('../models/Settings');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize'); 

Preset.belongsTo(Category, { foreignKey: 'category_id' });
Category.hasMany(Preset, { foreignKey: 'category_id' });

Watcher.belongsTo(Preset, { foreignKey: 'preset_id' });
Preset.hasMany(Watcher, { foreignKey: 'preset_id' });

Task.belongsTo(Preset, { foreignKey: 'preset_id' });
Preset.hasMany(Task, { foreignKey: 'preset_id' });

Task.belongsTo(RenameRule, { foreignKey: 'rename_rule_id' });
RenameRule.hasMany(Task, { foreignKey: 'rename_rule_id' });

const initDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    
    await createInitialData();
    
    await createMediaDirectories();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

const createInitialData = async () => {
  try {
    const adminUser = await User.findOne({ where: { email: 'admin' } });
    if (!adminUser) {
      await User.create({
        email: 'admin',
        password: 'admin',
        role: 'admin',
      });
      console.log('Admin user created: admin / admin');
    }

    const categories = await Category.count();
    if (categories === 0) {
      const defaultCategories = [
        { name: 'Video', description: 'Video processing presets' },
        { name: 'Audio', description: 'Audio processing presets' },
        { name: 'Image', description: 'Image processing presets' },
        { name: 'Document', description: 'Document processing presets' },
      ];
      
      for (const category of defaultCategories) {
        await Category.create(category);
      }
      console.log('Default categories created');
    }

    const renameRules = await RenameRule.count();
    if (renameRules === 0) {
      const defaultRules = [
        {
          name: 'Keep Original',
          value: 'original',
          description: 'Keep the original filename',
          pattern: '{original}',
          is_default: true,
        },
        {
          name: 'Custom Template',
          value: 'custom',
          description: 'Custom template with variables',
          pattern: '{project}_{YYYYMMDD}_{counter:02d}',
          example: 'project_20241217_01',
        },
      ];
      
      for (const rule of defaultRules) {
        await RenameRule.create(rule);
      }
      console.log('Default rename rules created');
    }

    const presets = await Preset.count();
    if (presets === 0) {
      const videoCategory = await Category.findOne({ where: { name: 'Video' } });
      if (videoCategory) {
        await Preset.create({
          category_id: videoCategory.id,
          name: 'HD Video MKV',
          format: 'mkv',
          resolution: '1920x1080',
          encoder: 'h264',
          parameters: {
            videoBitrate: '5000k',
            audioBitrate: '192k',
            fps: 30,
          },
        });
        console.log('Default preset created');
      }
    }

    await createDefaultSettings();

  } catch (error) {
    console.error('Error creating initial data:', error);
  }
};

const createDefaultSettings = async () => {
  try {
    const settingsCount = await Settings.count();
    if (settingsCount === 0) {
      const defaultSettings = [
        {
          key: 'media_path',
          value: path.join(__dirname, '../media'),
          type: 'path',
          category: 'folders',
          description: 'Основная папка с медиафайлами',
          editable: true
        },
        {
          key: 'default_input_path',
          value: 'input',
          type: 'path',
          category: 'folders',
          description: 'Папка по умолчанию для входных файлов',
          editable: true
        },
        {
          key: 'default_output_path',
          value: 'output',
          type: 'path',
          category: 'folders',
          description: 'Папка по умолчанию для выходных файлов',
          editable: true
        },
        {
          key: 'watch_folder',
          value: 'watch',
          type: 'path',
          category: 'folders',
          description: 'Папка для наблюдения за новыми файлами',
          editable: true
        },
        
        // Интервалы
        {
          key: 'watcher_check_interval',
          value: '30',
          type: 'number',
          category: 'intervals',
          description: 'Интервал проверки наблюдателей (секунды)',
          editable: true
        },
        {
          key: 'queue_check_interval',
          value: '10',
          type: 'number',
          category: 'intervals',
          description: 'Интервал проверки очереди (секунды)',
          editable: true
        },
        {
          key: 'cleanup_interval',
          value: '3600',
          type: 'number',
          category: 'intervals',
          description: 'Интервал очистки временных файлов (секунды)',
          editable: true
        },
        {
          key: 'backup_interval',
          value: '86400',
          type: 'number',
          category: 'intervals',
          description: 'Интервал создания резервных копий (секунды)',
          editable: true
        },
        
        // Ограничения
        {
          key: 'max_concurrent_tasks',
          value: '3',
          type: 'number',
          category: 'limits',
          description: 'Максимальное количество одновременных задач',
          editable: true
        },
        {
          key: 'max_file_size',
          value: '2147483648',
          type: 'number',
          category: 'limits',
          description: 'Максимальный размер файла (байты)',
          editable: true
        },
        {
          key: 'retry_attempts',
          value: '3',
          type: 'number',
          category: 'limits',
          description: 'Количество повторных попыток при ошибке',
          editable: true
        },
        {
          key: 'max_queue_size',
          value: '100',
          type: 'number',
          category: 'limits',
          description: 'Максимальный размер очереди',
          editable: true
        },
        
      ];

      for (const setting of defaultSettings) {
        await Settings.create(setting);
      }
      console.log(`Default settings created: ${defaultSettings.length} entries`);
    } else {
      console.log(`Settings already exist: ${settingsCount} entries`);
    }
  } catch (error) {
    console.error('Error creating default settings:', error);
  }
};

const createMediaDirectories = async () => {
  try {
    const mediaPath = await Settings.getByKey('media_path', path.join(__dirname, '../media'));
    console.log(`Media path from settings: ${mediaPath}`);
    
    const folderSettings = await Settings.findAll({
      where: { 
        category: 'folders',
        key: {
          [Op.ne]: 'media_path' 
        }
      }
    });
    
    if (!fs.existsSync(mediaPath)) {
      fs.mkdirSync(mediaPath, { recursive: true });
      console.log(`📁 Created main media directory: ${mediaPath}`);
    } else {
      console.log(`📁 Main media directory already exists: ${mediaPath}`);
    }
    
    for (const setting of folderSettings) {
      const folderName = setting.value;
      if (folderName && folderName.trim() !== '') {
        const folderPath = path.join(mediaPath, folderName);
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
          console.log(`📁 Created directory: ${folderPath}`);
        } else {
          console.log(`📁 Directory already exists: ${folderPath}`);
        }
      }
    }
    
    console.log('✅ All media directories created successfully');
  } catch (error) {
    console.error('❌ Error creating media directories:', error);
    throw error;
  }
};

module.exports = { initDatabase, sequelize };
// controllers/api.controller.js
const fs = require('fs');
const path = require('path');
const os = require('os');
const { Op } = require('sequelize');

const {
  Category,
  Preset,
  RenameRule,
  Watcher,
  Task,
  TaskHistory,
  Settings,
  sequelize,
} = require('../models');

// === Константы ===
const BASE_PATH = process.env.BASE_MEDIA_PATH || path.join(__dirname, '../media');

const getBasePath = async () => {
  try {
    const mediaPathSetting = await Settings.findOne({ where: { key: 'media_path' } });
    
    if (mediaPathSetting && mediaPathSetting.value) {
      return mediaPathSetting.value;
    }
    
    return BASE_PATH;
  } catch (error) {
    console.warn('Error getting media path from settings:', error.message);
    return BASE_PATH;
  }
};

const scanDirectory = async (dirPath) => {
  const items = [];
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith('.') || 
          entry.name === 'Config.Msi' || 
          entry.name === '$RECYCLE.BIN' ||
          entry.name === 'System Volume Information') {
        continue;
      }

      const fullPath = path.join(dirPath, entry.name);
      const basePath = await getBasePath();
      const relPath = path.relative(basePath, fullPath).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        items.push({
          name: entry.name,
          path: relPath,
          isDirectory: true,
          children: await scanDirectory(fullPath),
        });
      } else {
        const stat = fs.statSync(fullPath);
        items.push({
          name: entry.name,
          path: relPath,
          isDirectory: false,
          size: stat.size,
          modified: stat.mtime,
          extension: path.extname(entry.name).toLowerCase()
        });
      }
    }
  } catch (err) {
    console.warn(`⚠️  Skipping inaccessible directory: ${dirPath}`, err.message);
  }
  return items;
};

const getServerInfo = async (req, res) => {
  try {
    const basePath = await getBasePath();
    
    const info = {
      os: {
        platform: os.platform(),
        release: os.release(),
        type: os.type(),
        arch: os.arch()
      },
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem()
      },
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0]?.model || 'Unknown'
      },
      uptime: os.uptime(),
      hostname: os.hostname(),
      userInfo: os.userInfo(),
      mediaPath: basePath,
      mediaPathExists: fs.existsSync(basePath),
      database: {
        dialect: sequelize.getDialect(),
        storage: sequelize.config.storage || 'memory',
      },
      settings: {
        usingDatabase: true,
        totalSettings: await Settings.count()
      }
    };
    res.json(info);
  } catch (err) {
    console.error('Server info error:', err);
    res.status(500).json({ message: 'Failed to get server info' });
  }
};

const getTaskHistory = async (req, res) => {
  try {
    const history = await TaskHistory.findAll({
      order: [['completed_at', 'DESC']],
      limit: 100,
    });
    res.json(history);
  } catch (err) {
    console.error('Task history error:', err);
    res.status(500).json({ message: 'Failed to load task history' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']],
    });
    res.json(categories);
  } catch (err) {
    console.error('Categories error:', err);
    res.status(500).json({ message: 'Failed to load categories' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(409).json({ message: 'Category already exists' });
    }

    const newCategory = await Category.create({
      name,
      description: description || '',
    });

    res.status(201).json(newCategory);
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ message: 'Failed to create category' });
  }
};

const getRenameRules = async (req, res) => {
  try {
    const rules = await RenameRule.findAll({
      order: [['is_default', 'DESC'], ['name', 'ASC']],
    });
    res.json(rules);
  } catch (err) {
    console.error('Rename rules error:', err);
    res.status(500).json({ message: 'Failed to load rename rules' });
  }
};

const createRenameRule = async (req, res) => {
  try {
    const { name, value, description, pattern, example, is_default = false } = req.body;
    
    if (!name || !value || !pattern) {
      return res.status(400).json({ 
        message: 'Name, value and pattern are required' 
      });
    }

    const transaction = await sequelize.transaction();

    try {
      if (is_default) {
        await RenameRule.update(
          { is_default: false },
          { where: { is_default: true }, transaction }
        );
      }

      const newRule = await RenameRule.create({
        name,
        value,
        description: description || '',
        pattern,
        example: example || '',
        is_default,
      }, { transaction });

      await transaction.commit();
      res.status(201).json(newRule);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('Create rename rule error:', err);
    res.status(500).json({ message: 'Failed to create rename rule' });
  }
};

const deleteRenameRule = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await sequelize.transaction();

    try {
      const rule = await RenameRule.findByPk(id, { transaction });
      
      if (!rule) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Rule not found' });
      }

      const tasksUsingRule = await Task.count({ 
        where: { rename_rule_id: id },
        transaction 
      });

      if (tasksUsingRule > 0) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: 'Cannot delete rule that is used in tasks' 
        });
      }

      if (rule.is_default) {
        const totalRules = await RenameRule.count({ transaction });
        if (totalRules === 1) {
          await transaction.rollback();
          return res.status(400).json({ 
            message: 'Cannot delete the only default rule' 
          });
        }
      }

      await rule.destroy({ transaction });
      await transaction.commit();
      
      res.json({ message: 'Rule deleted successfully' });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('Delete rename rule error:', err);
    res.status(500).json({ message: 'Failed to delete rename rule' });
  }
};

// === Получение полной файловой структуры ===
const getFileSystemStructure = async (req, res) => {
  try {
    const basePath = await getBasePath();
    
    if (!fs.existsSync(basePath)) {
      return res.status(500).json({ message: 'Media directory not initialized' });
    }

    const tree = await scanDirectory(basePath);
    res.json(tree);
  } catch (err) {
    console.error('FS tree error:', err);
    res.status(500).json({ message: 'Failed to build directory tree' });
  }
};

// === Создание директории ===
const createDirectory = async (req, res) => {
  try {
    const { path: dirPath } = req.body;
    if (!dirPath) {
      return res.status(400).json({ message: 'Path is required' });
    }

    const basePath = await getBasePath();
    const fullPath = path.join(basePath, dirPath);
    
    if (fs.existsSync(fullPath)) {
      return res.status(400).json({ message: 'Directory already exists' });
    }

    fs.mkdirSync(fullPath, { recursive: true });
    res.status(201).json({ 
      message: 'Directory created successfully',
      path: dirPath 
    });
  } catch (err) {
    console.error('Create directory error:', err);
    res.status(500).json({ message: 'Failed to create directory' });
  }
};

// === Удаление файла или директории ===
const deleteFileOrDirectory = async (req, res) => {
  try {
    const { path: targetPath } = req.query;
    if (!targetPath) {
      return res.status(400).json({ message: 'Path is required' });
    }

    const basePath = await getBasePath();
    const fullPath = path.join(basePath, targetPath);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'Path not found' });
    }

    if (fullPath === basePath || fullPath === path.resolve(basePath)) {
      return res.status(400).json({ message: 'Cannot delete root directory' });
    }

    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(fullPath);
    }

    res.json({ 
      message: 'Deleted successfully',
      path: targetPath 
    });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Failed to delete' });
  }
};

const getWatcher = async (req, res) => {
  try {
    const watchers = await Watcher.findAll({
      include: [{
        model: Preset,
        include: [Category],
      }],
      order: [['createdAt', 'DESC']],
    });
    res.json(watchers);
  } catch (err) {
    console.error('Get watchers error:', err);
    res.status(500).json({ message: 'Failed to load watchers' });
  }
};

const createWatcher = async (req, res) => {
  try {
    const { watch_dir, output_dir, preset_id, rules = '' } = req.body;
    
    if (!watch_dir || !output_dir || !preset_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const preset = await Preset.findByPk(preset_id);
    if (!preset) {
      return res.status(404).json({ message: 'Preset not found' });
    }

    const newWatcher = await Watcher.create({
      watch_dir,
      output_dir,
      preset_id,
      rules,
      status: 'active',
      last_checked: new Date(),
    });

    const watcherWithPreset = await Watcher.findByPk(newWatcher.id, {
      include: [{
        model: Preset,
        include: [Category],
      }],
    });

    res.status(201).json(watcherWithPreset);
  } catch (err) {
    console.error('Create watcher error:', err);
    res.status(500).json({ message: 'Failed to create watcher' });
  }
};

const updateWatcher = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const watcher = await Watcher.findByPk(id);
    if (!watcher) {
      return res.status(404).json({ message: 'Watcher not found' });
    }

    if (updates.preset_id) {
      const preset = await Preset.findByPk(updates.preset_id);
      if (!preset) {
        return res.status(404).json({ message: 'Preset not found' });
      }
    }

    await watcher.update(updates);
    
    const updatedWatcher = await Watcher.findByPk(id, {
      include: [{
        model: Preset,
        include: [Category],
      }],
    });

    res.json(updatedWatcher);
  } catch (err) {
    console.error('Update watcher error:', err);
    res.status(500).json({ message: 'Failed to update watcher' });
  }
};

const deleteWatcher = async (req, res) => {
  try {
    const { id } = req.params;
    const watcher = await Watcher.findByPk(id);
    
    if (!watcher) {
      return res.status(404).json({ message: 'Watcher not found' });
    }

    await watcher.destroy();
    res.json({ message: 'Watcher deleted successfully' });
  } catch (err) {
    console.error('Delete watcher error:', err);
    res.status(500).json({ message: 'Failed to delete watcher' });
  }
};

const getQueue = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [
        {
          model: Preset,
          include: [Category],
        },
        {
          model: RenameRule,
        },
      ],
      order: [
        ['status', 'ASC'],
        ['createdAt', 'DESC'],
      ],
      where: {
        status: {
          [Op.notIn]: ['Completed', 'Failed'],
        },
      },
    });
    res.json(tasks);
  } catch (err) {
    console.error('Get queue error:', err);
    res.status(500).json({ message: 'Failed to load queue' });
  }
};

const createQueueItem = async (req, res) => {
  try {
    const { 
      input_path, 
      input_mode, 
      output_path, 
      output_mode, 
      preset_id, 
      rename_rule_id 
    } = req.body;
    
    if (!input_path || !output_path || !preset_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const preset = await Preset.findByPk(preset_id);
    if (!preset) {
      return res.status(404).json({ message: 'Preset not found' });
    }

    if (rename_rule_id) {
      const renameRule = await RenameRule.findByPk(rename_rule_id);
      if (!renameRule) {
        return res.status(404).json({ message: 'Rename rule not found' });
      }
    }

    const newTask = await Task.create({
      input_path,
      input_mode: input_mode || 'file',
      output_path,
      output_mode: output_mode || 'file',
      preset_id,
      rename_rule_id: rename_rule_id || null,
      status: 'Queued',
      progress: 0,
      created_at: new Date(),
    });

    const taskWithDetails = await Task.findByPk(newTask.id, {
      include: [
        {
          model: Preset,
          include: [Category],
        },
        {
          model: RenameRule,
        },
      ],
    });

    res.status(201).json(taskWithDetails);
  } catch (err) {
    console.error('Create queue item error:', err);
    res.status(500).json({ message: 'Failed to create task' });
  }
};

const updateQueueItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (updates.status === 'Completed' || updates.status === 'Failed') {
      const preset = await Preset.findByPk(task.preset_id, {
        include: [Category],
      });
      
      const renameRule = task.rename_rule_id ? 
        await RenameRule.findByPk(task.rename_rule_id) : null;

      await TaskHistory.create({
        original_task_id: task.id,
        input_path: task.input_path,
        input_mode: task.input_mode,
        output_path: task.output_path,
        output_mode: task.output_mode,
        preset_name: preset ? preset.name : 'Unknown',
        rename_rule: renameRule ? renameRule.name : null,
        status: updates.status,
        progress: updates.progress || task.progress,
        error_message: updates.error_message || task.error_message,
        created_at: task.created_at,
        started_at: task.started_at,
        completed_at: new Date(),
        duration_ms: task.started_at ? 
          new Date() - task.started_at : 0,
      });
    }

    await task.update(updates);

    const updatedTask = await Task.findByPk(id, {
      include: [
        {
          model: Preset,
          include: [Category],
        },
        {
          model: RenameRule,
        },
      ],
    });

    res.json(updatedTask);
  } catch (err) {
    console.error('Update queue item error:', err);
    res.status(500).json({ message: 'Failed to update task' });
  }
};

const deleteQueueItem = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.destroy();
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Delete queue item error:', err);
    res.status(500).json({ message: 'Failed to delete task' });
  }
};

const getPresets = async (req, res) => {
  try {
    const presets = await Preset.findAll({
      include: [Category],
      order: [['name', 'ASC']],
    });
    res.json(presets);
  } catch (err) {
    console.error('Get presets error:', err);
    res.status(500).json({ message: 'Failed to load presets' });
  }
};

const createPreset = async (req, res) => {
  try {
    const { 
      category_id, 
      name, 
      format, 
      resolution, 
      encoder, 
      parameters = {} 
    } = req.body;
    
    if (!category_id || !name || !format || !resolution || !encoder) {
      return res.status(400).json({ message: 'All preset fields are required' });
    }

    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const existingPreset = await Preset.findOne({ where: { name } });
    if (existingPreset) {
      return res.status(409).json({ message: 'Preset already exists' });
    }

    const newPreset = await Preset.create({
      category_id,
      name,
      format,
      resolution,
      encoder,
      parameters,
    });

    const presetWithCategory = await Preset.findByPk(newPreset.id, {
      include: [Category],
    });

    res.status(201).json(presetWithCategory);
  } catch (err) {
    console.error('Create preset error:', err);
    res.status(500).json({ message: 'Failed to create preset' });
  }
};

const updatePreset = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const preset = await Preset.findByPk(id);
    if (!preset) {
      return res.status(404).json({ message: 'Preset not found' });
    }

    if (updates.category_id) {
      const category = await Category.findByPk(updates.category_id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
    }

    await preset.update(updates);

    const updatedPreset = await Preset.findByPk(id, {
      include: [Category],
    });

    res.json(updatedPreset);
  } catch (err) {
    console.error('Update preset error:', err);
    res.status(500).json({ message: 'Failed to update preset' });
  }
};

const deletePreset = async (req, res) => {
  try {
    const { id } = req.params;
    const preset = await Preset.findByPk(id);
    
    if (!preset) {
      return res.status(404).json({ message: 'Preset not found' });
    }

    const tasksUsingPreset = await Task.count({ where: { preset_id: id } });
    const watchersUsingPreset = await Watcher.count({ where: { preset_id: id } });

    if (tasksUsingPreset > 0 || watchersUsingPreset > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete preset that is used in tasks or watchers' 
      });
    }

    await preset.destroy();
    res.json({ message: 'Preset deleted successfully' });
  } catch (err) {
    console.error('Delete preset error:', err);
    res.status(500).json({ message: 'Failed to delete preset' });
  }
};

const startProcessing = async (req, res) => {
  try {
    await Task.update(
      { 
        status: 'Processing',
        started_at: new Date() 
      },
      { 
        where: { 
          status: 'Queued',
          started_at: null 
        } 
      }
    );

    res.json({ 
      message: 'Processing started',
      timestamp: new Date().toISOString() 
    });
  } catch (err) {
    console.error('Start processing error:', err);
    res.status(500).json({ message: 'Failed to start processing' });
  }
};

const stopProcessing = (req, res) => {
  try {
    res.json({ 
      message: 'Processing stopped',
      timestamp: new Date().toISOString() 
    });
  } catch (err) {
    console.error('Stop processing error:', err);
    res.status(500).json({ message: 'Failed to stop processing' });
  }
};

const pauseProcessing = (req, res) => {
  try {
    res.json({ 
      message: 'Processing paused',
      timestamp: new Date().toISOString() 
    });
  } catch (err) {
    console.error('Pause processing error:', err);
    res.status(500).json({ message: 'Failed to pause processing' });
  }
};

const resumeProcessing = (req, res) => {
  try {
    res.json({ 
      message: 'Processing resumed',
      timestamp: new Date().toISOString() 
    });
  } catch (err) {
    console.error('Resume processing error:', err);
    res.status(500).json({ message: 'Failed to resume processing' });
  }
};

const clearCompleted = async (req, res) => {
  try {
    const completedTasks = await Task.findAll({
      where: {
        status: {
          [Op.in]: ['Completed', 'Failed'],
        },
      },
      include: [
        {
          model: Preset,
          attributes: ['name'],
        },
        {
          model: RenameRule,
          attributes: ['name'],
        },
      ],
    });

    for (const task of completedTasks) {
      await TaskHistory.create({
        original_task_id: task.id,
        input_path: task.input_path,
        input_mode: task.input_mode,
        output_path: task.output_path,
        output_mode: task.output_mode,
        preset_name: task.Preset ? task.Preset.name : 'Unknown',
        rename_rule: task.RenameRule ? task.RenameRule.name : null,
        status: task.status,
        progress: task.progress,
        error_message: task.error_message,
        created_at: task.created_at,
        started_at: task.started_at,
        completed_at: task.completed_at || new Date(),
        duration_ms: task.started_at && task.completed_at ? 
          new Date(task.completed_at) - new Date(task.started_at) : 0,
      });
    }

    const deletedCount = await Task.destroy({
      where: {
        status: {
          [Op.in]: ['Completed', 'Failed'],
        },
      },
    });

    res.json({ 
      message: `Cleared ${deletedCount} completed tasks`,
      cleared: deletedCount,
      remaining: await Task.count()
    });
  } catch (err) {
    console.error('Clear completed error:', err);
    res.status(500).json({ message: 'Failed to clear completed tasks' });
  }
};

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const countFolderItems = (dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) return 0;
    
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    return entries.length;
  } catch (err) {
    return 0;
  }
};

const getFolders = async (req, res) => {
  try {
    const folders = await Settings.findAll({
      where: {
        category: 'folders'
      },
      order: [['id', 'ASC']],
    });
    
    if (folders.length === 0) {
      const { initDatabase } = require('../config/initDatabase');
      await initDatabase();
      
      const refreshedFolders = await Settings.findAll({
        where: { category: 'folders' },
        order: [['id', 'ASC']],
      });
      
      const formattedFolders = refreshedFolders.map(folder => ({
        id: folder.id,
        key: folder.key,
        name: folder.description || folder.key,
        path: folder.value,
        type: folder.type,
        editable: folder.editable,
        category: folder.category,
        description: folder.description,
        created_at: folder.created_at,
        updated_at: folder.updated_at
      }));
      
      return res.json(formattedFolders);
    }
    
    const formattedFolders = folders.map(folder => ({
      id: folder.id,
      key: folder.key,
      name: folder.description || folder.key,
      path: folder.value,
      type: folder.type,
      editable: folder.editable,
      category: folder.category,
      description: folder.description,
      created_at: folder.created_at,
      updated_at: folder.updated_at
    }));
    
    res.json(formattedFolders);
  } catch (err) {
    console.error('Get folders error:', err);
    res.status(500).json({ message: 'Failed to load folders' });
  }
};

const updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { path: newPath, editable } = req.body;
    
    const folder = await Settings.findByPk(id);
    
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    
    if (folder.category !== 'folders') {
      return res.status(400).json({ message: 'Can only update folder settings' });
    }
    
    const updates = {};
    
    if (newPath !== undefined) {
      if (typeof newPath !== 'string' || newPath.trim() === '') {
        return res.status(400).json({ 
          message: 'Path must be a non-empty string' 
        });
      }
      
      const cleanPath = newPath.trim()
        .replace(/\\/g, '/')
        .replace(/\/+/g, '/')
        .replace(/\/$/, '');
      
      updates.value = cleanPath;
    }
    
    if (editable !== undefined && folder.editable) {
      updates.editable = Boolean(editable);
    }
    
    if (Object.keys(updates).length > 0) {
      await folder.update(updates);
      await folder.update({ updated_at: new Date() });
    }
    
    const updatedFolder = await Settings.findByPk(id);
    
    res.json({
      success: true,
      message: 'Folder updated successfully',
      folder: {
        id: updatedFolder.id,
        key: updatedFolder.key,
        name: updatedFolder.description || updatedFolder.key,
        path: updatedFolder.value,
        type: updatedFolder.type,
        editable: updatedFolder.editable,
        category: updatedFolder.category,
        description: updatedFolder.description,
        updated_at: updatedFolder.updated_at
      }
    });
  } catch (err) {
    console.error('Update folder error:', err);
    
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: err.errors.map(e => e.message) 
      });
    }
    
    res.status(500).json({ message: 'Failed to update folder' });
  }
};

const createFolder = async (req, res) => {
  try {
    const { key, path: folderPath, description, editable = true } = req.body;
    
    if (!key || !folderPath) {
      return res.status(400).json({ 
        message: 'Key and path are required' 
      });
    }
    
    const existingFolder = await Settings.findOne({ 
      where: { key, category: 'folders' } 
    });
    
    if (existingFolder) {
      return res.status(409).json({ 
        message: 'Folder setting with this key already exists' 
      });
    }
    
    const newFolder = await Settings.create({
      key: key.trim(),
      value: folderPath.trim()
        .replace(/\\/g, '/')
        .replace(/\/+/g, '/')
        .replace(/\/$/, ''),
      type: 'path',
      category: 'folders',
      description: description || `Custom folder: ${key}`,
      editable: Boolean(editable),
    });
    
    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      folder: {
        id: newFolder.id,
        key: newFolder.key,
        name: newFolder.description || newFolder.key,
        path: newFolder.value,
        type: newFolder.type,
        editable: newFolder.editable,
        category: newFolder.category,
        description: newFolder.description,
        created_at: newFolder.created_at,
        updated_at: newFolder.updated_at
      }
    });
  } catch (err) {
    console.error('Create folder error:', err);
    
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: err.errors.map(e => e.message) 
      });
    }
    
    res.status(500).json({ message: 'Failed to create folder' });
  }
};

// === Удаление папки ===
const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const folder = await Settings.findByPk(id);
    
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    
    if (folder.category !== 'folders') {
      return res.status(400).json({ message: 'Can only delete folder settings' });
    }
    
    const systemFolders = [
      'media_path',
      'default_input_path',
      'default_output_path',
      'temp_path',
      'watch_folder',
      'archive_path',
      'log_path',
      'backup_path'
    ];
    
    if (systemFolders.includes(folder.key)) {
      return res.status(400).json({ 
        message: 'Cannot delete system folder setting' 
      });
    }
    
    await folder.destroy();
    
    res.json({
      success: true,
      message: 'Folder deleted successfully',
      deletedId: id
    });
  } catch (err) {
    console.error('Delete folder error:', err);
    res.status(500).json({ message: 'Failed to delete folder' });
  }
};

const syncFolders = async (req, res) => {
  try {
    const folders = await Settings.findAll({
      where: { category: 'folders' },
      order: [['id', 'ASC']],
    });
    
    const mediaPathSetting = folders.find(f => f.key === 'media_path');
    
    if (!mediaPathSetting) {
      return res.status(500).json({ 
        message: 'Media path not configured in settings' 
      });
    }
    
    const mediaPath = mediaPathSetting.value || BASE_PATH;
    const results = [];
    
    // Создаем основную папку media
    if (!fs.existsSync(mediaPath)) {
      try {
        fs.mkdirSync(mediaPath, { recursive: true });
        results.push({
          key: 'media_path',
          path: mediaPath,
          action: 'created',
          success: true
        });
      } catch (err) {
        results.push({
          key: 'media_path',
          path: mediaPath,
          action: 'create failed',
          success: false,
          error: err.message
        });
      }
    } else {
      results.push({
        key: 'media_path',
        path: mediaPath,
        action: 'already exists',
        success: true
      });
    }
    
    // Создаем подпапки
    for (const folder of folders) {
      if (folder.key === 'media_path') continue;
      
      const folderPath = path.join(mediaPath, folder.value);
      
      try {
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
          results.push({
            key: folder.key,
            path: folder.value,
            fullPath: folderPath,
            action: 'created',
            success: true
          });
        } else {
          results.push({
            key: folder.key,
            path: folder.value,
            fullPath: folderPath,
            action: 'already exists',
            success: true
          });
        }
      } catch (err) {
        results.push({
          key: folder.key,
          path: folder.value,
          fullPath: folderPath,
          action: 'create failed',
          success: false,
          error: err.message
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Folder synchronization completed',
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });
  } catch (err) {
    console.error('Sync folders error:', err);
    res.status(500).json({ message: 'Failed to synchronize folders' });
  }
};

const getFolderSize = async (req, res) => {
  try {
    const { id } = req.params;
    
    const folderSetting = await Settings.findByPk(id);
    
    if (!folderSetting || folderSetting.category !== 'folders') {
      return res.status(404).json({ message: 'Folder not found' });
    }
    
    const folders = await Settings.findAll({
      where: { category: 'folders' }
    });
    
    const mediaPathSetting = folders.find(f => f.key === 'media_path');
    const mediaPath = mediaPathSetting?.value || BASE_PATH;
    
    if (!folderSetting.value) {
      return res.json({
        exists: false,
        size: 0,
        sizeFormatted: '0 B'
      });
    }
    
    const folderPath = path.join(mediaPath, folderSetting.value);
    
    if (!fs.existsSync(folderPath)) {
      return res.json({
        exists: false,
        size: 0,
        sizeFormatted: '0 B'
      });
    }
    
    const stats = fs.statSync(folderPath);
    
    if (!stats.isDirectory()) {
      return res.json({
        exists: true,
        isDirectory: false,
        size: stats.size,
        sizeFormatted: formatBytes(stats.size)
      });
    }
    
    let totalSize = 0;
    let fileCount = 0;
    let dirCount = 0;
    
    function calculateSize(dirPath) {
      try {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          
          try {
            const stat = fs.statSync(fullPath);
            
            if (entry.isDirectory()) {
              dirCount++;
              calculateSize(fullPath);
            } else {
              fileCount++;
              totalSize += stat.size;
            }
          } catch (err) {
            console.warn(`Cannot access: ${fullPath}`, err.message);
          }
        }
      } catch (err) {
        console.warn(`Cannot read directory: ${dirPath}`, err.message);
      }
    }
    
    calculateSize(folderPath);
    
    res.json({
      exists: true,
      isDirectory: true,
      size: totalSize,
      sizeFormatted: formatBytes(totalSize),
      itemCount: fileCount + dirCount,
      fileCount,
      dirCount,
      lastModified: stats.mtime,
      created: stats.ctime
    });
  } catch (err) {
    console.error('Get folder size error:', err);
    res.status(500).json({ message: 'Failed to get folder size' });
  }
};

module.exports = {
  getWatcher,
  getQueue,
  getPresets,
  getRenameRules,
  getCategories,
  getServerInfo,
  getTaskHistory,
  getFileSystemStructure,
  getFolders,
  getFolderSize,
  
  // Создание
  createWatcher,
  createQueueItem,
  createPreset,
  createRenameRule,
  createCategory,
  createFolder,
  
  // Обновление
  updateQueueItem,
  updateWatcher,
  updatePreset,
  updateFolder,
  
  // Удаление
  deleteQueueItem,
  deleteWatcher,
  deletePreset,
  deleteRenameRule,
  deleteFolder,
  
  // Файловые операции
  createDirectory,
  deleteFileOrDirectory,
  
  // Прочее
  startProcessing,
  stopProcessing,
  pauseProcessing,
  resumeProcessing,
  clearCompleted,
  syncFolders,
};
// models/Settings.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Settings = sequelize.define('Settings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('string', 'number', 'boolean', 'json', 'path'),
    defaultValue: 'string'
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'general'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  editable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'settings',
  timestamps: false,
  hooks: {
    beforeCreate: (settings) => {
      settings.created_at = new Date();
      settings.updated_at = new Date();
    },
    beforeUpdate: (settings) => {
      settings.updated_at = new Date();
    },
  },
});

Settings.parseValue = function(value, type) {
  if (value === null || value === undefined || value === '') return null;
  
  switch (type) {
    case 'number':
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    case 'boolean':
      return value === 'true' || value === '1' || value === true;
    case 'json':
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    default:
      return value;
  }
};

Settings.stringifyValue = function(value, type) {
  if (value === null || value === undefined) return null;
  
  switch (type) {
    case 'number':
    case 'boolean':
      return String(value);
    case 'json':
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    default:
      return String(value);
  }
};

Settings.getByKey = async function(key, defaultValue = null) {
  try {
    const setting = await this.findOne({ where: { key } });
    if (!setting) return defaultValue;
    
    return this.parseValue(setting.value, setting.type);
  } catch (error) {
    console.error('Error getting setting by key:', error);
    return defaultValue;
  }
};

Settings.setByKey = async function(key, value, options = {}) {
  try {
    const [setting, created] = await this.findOrCreate({
      where: { key },
      defaults: {
        key,
        value: this.stringifyValue(value, options.type || 'string'),
        type: options.type || 'string',
        category: options.category || 'general',
        description: options.description || '',
        editable: options.editable !== false,
      },
    });
    
    if (!created) {
      await setting.update({
        value: this.stringifyValue(value, setting.type),
        type: options.type || setting.type,
        category: options.category || setting.category,
        description: options.description || setting.description,
        editable: options.editable !== false ? options.editable : setting.editable,
      });
    }
    
    return setting;
  } catch (error) {
    console.error('Error setting by key:', error);
    throw error;
  }
};

Settings.getAll = async function() {
  try {
    const settings = await this.findAll();
    return settings.reduce((acc, setting) => {
      acc[setting.key] = this.parseValue(setting.value, setting.type);
      return acc;
    }, {});
  } catch (error) {
    console.error('Error getting all settings:', error);
    return {};
  }
};

module.exports = Settings;
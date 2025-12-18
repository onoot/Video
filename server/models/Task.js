// models/Task.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  input_path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  input_mode: {
    type: DataTypes.ENUM('file', 'folder'),
    defaultValue: 'file',
  },
  output_path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  output_mode: {
    type: DataTypes.ENUM('file', 'folder'),
    defaultValue: 'file',
  },
  preset_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'presets',
      key: 'id',
    },
  },
  rename_rule_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'rename_rules',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('Queued', 'Processing', 'Completed', 'Failed', 'Paused', 'Cancelled'),
    defaultValue: 'Queued',
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100,
    },
  },
  started_at: {
    type: DataTypes.DATE,
  },
  completed_at: {
    type: DataTypes.DATE,
  },
  error_message: {
    type: DataTypes.TEXT,
  },
  log_file: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'tasks',
});

module.exports = Task;
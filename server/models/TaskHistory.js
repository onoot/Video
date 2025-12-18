// models/TaskHistory.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TaskHistory = sequelize.define('TaskHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  original_task_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
  preset_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rename_rule: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM('Completed', 'Failed'),
    allowNull: false,
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  },
  error_message: {
    type: DataTypes.TEXT,
  },
  duration_ms: {
    type: DataTypes.INTEGER,
  },
  created_at: {
    type: DataTypes.DATE,
  },
  started_at: {
    type: DataTypes.DATE,
  },
  completed_at: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'task_history',
  timestamps: false,
});

module.exports = TaskHistory;
// models/Watcher.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Watcher = sequelize.define('Watcher', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  watch_dir: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  output_dir: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  preset_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'presets',
      key: 'id',
    },
  },
  rules: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'paused'),
    defaultValue: 'active',
  },
  last_checked: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'watchers',
});

module.exports = Watcher;
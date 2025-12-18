// models/Preset.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Preset = sequelize.define('Preset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  format: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  resolution: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  encoder: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  parameters: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
}, {
  tableName: 'presets',
});

module.exports = Preset;
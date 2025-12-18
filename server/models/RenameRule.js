// models/RenameRule.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RenameRule = sequelize.define('RenameRule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  pattern: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  example: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'rename_rules',
});

module.exports = RenameRule;
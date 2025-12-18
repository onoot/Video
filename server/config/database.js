// config/database.js
const path = require('path');
const { Sequelize } = require('sequelize');

const dbPath = path.join(__dirname, '../data/database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

module.exports = sequelize;
// models/User.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [4, 100]
    }
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user',
    validate: {
      isIn: [['user', 'admin']]
    }
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true,
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
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
      user.created_at = new Date();
      user.updated_at = new Date();
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
      user.updated_at = new Date();
    }
  }
});

User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.updateProfile = async function(data) {
  if (data.password) {
    this.password = data.password;
  }
  if (data.email) {
    this.email = data.email;
  }
  if (data.username) {
    this.username = data.username;
  }
  return await this.save();
};

User.findByEmail = async function(email) {
  return await this.findOne({ where: { email } });
};

User.createWithValidation = async function(userData) {
  if (!userData.email || !userData.password) {
    throw new Error('Email and password are required');
  }
  
  const existingUser = await this.findOne({ where: { email: userData.email } });
  if (existingUser) {
    throw new Error('Email already exists');
  }
  
  return await this.create(userData);
};

module.exports = User;
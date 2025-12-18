const Sequelize = require('sequelize');
const User = require('./User')
const Category = require('./Category')
const Preset = require('./Preset')
const RenameRule = require('./RenameRule')
const Task = require('./Task')
const TaskHistory = require('./TaskHistory')
const Watcher = require('./Watcher')
const Settings = require('./Settings')

module.exports = {
    Sequelize,
    User,
    Category,
    Preset,
    RenameRule,
    Task,
    TaskHistory,
    Watcher,
    Settings
}
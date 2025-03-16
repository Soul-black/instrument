const User = require('./User');
const Tool = require('./Tool');
const Request = require('./Request');
const Notification = require('./Notification');
const Category = require('./Category');

// User - Request associations
User.hasMany(Request, { as: 'requests', foreignKey: 'userId' });
Request.belongsTo(User, { as: 'user', foreignKey: 'userId' });

// Tool - Request associations
Tool.hasMany(Request, { as: 'requests', foreignKey: 'toolId' });
Request.belongsTo(Tool, { as: 'tool', foreignKey: 'toolId' });

// User - Notification associations
User.hasMany(Notification, { as: 'notifications', foreignKey: 'userId' });
Notification.belongsTo(User, { as: 'user', foreignKey: 'userId' });

// Request - Notification associations
Request.hasMany(Notification, { as: 'notifications', foreignKey: 'requestId' });
Notification.belongsTo(Request, { as: 'request', foreignKey: 'requestId' });

// Category - Tool associations
Category.hasMany(Tool, { as: 'tools', foreignKey: 'categoryId' });
Tool.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });

module.exports = {
  User,
  Tool,
  Request,
  Notification,
  Category
}; 
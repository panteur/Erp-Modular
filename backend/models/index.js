const Company = require('./Company');
const Branch = require('./Branch');
const SystemModule = require('./SystemModule');
const Role = require('./Role');
const User = require('./User');
const UserProfile = require('./UserProfile');
const UserSession = require('./UserSession');
const CompanyModule = require('./CompanyModule');
const Category = require('./Category');
const Item = require('./Item');
const Inventory = require('./Inventory');

Company.hasMany(Branch, { foreignKey: 'company_id', as: 'branches' });
Branch.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

Company.hasMany(Role, { foreignKey: 'company_id', as: 'roles' });
Role.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

Branch.hasMany(Role, { foreignKey: 'branch_id', as: 'branchRoles' });
Role.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });

Company.hasMany(User, { foreignKey: 'company_id', as: 'users' });
User.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

Branch.hasMany(User, { foreignKey: 'branch_id', as: 'branchUsers' });
User.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });

Role.hasMany(User, { foreignKey: 'role_id', as: 'roleUsers' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

User.hasOne(UserProfile, { foreignKey: 'user_id', as: 'profile' });
UserProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(UserSession, { foreignKey: 'user_id', as: 'sessions' });
UserSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Company.belongsToMany(SystemModule, {
  through: CompanyModule,
  foreignKey: 'company_id',
  as: 'modules'
});
SystemModule.belongsToMany(Company, {
  through: CompanyModule,
  foreignKey: 'module_id',
  as: 'companies'
});

Company.hasMany(Category, { foreignKey: 'company_id', as: 'categories' });
Category.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

Category.hasMany(Item, { foreignKey: 'category_id', as: 'items' });
Item.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

Company.hasMany(Item, { foreignKey: 'company_id', as: 'companyItems' });
Item.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

Item.hasMany(Inventory, { foreignKey: 'item_id', as: 'stockEntries' });
Inventory.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });

Branch.hasMany(Inventory, { foreignKey: 'branch_id', as: 'stockEntries' });
Inventory.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });

module.exports = {
  Company,
  Branch,
  SystemModule,
  Role,
  User,
  UserProfile,
  UserSession,
  CompanyModule,
  Category,
  Item,
  Inventory
};

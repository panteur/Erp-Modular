const Company = require('./Company');
const Branch = require('./Branch');
const SystemModule = require('./SystemModule');
const Role = require('./Role');
const User = require('./User');
const UserProfile = require('./UserProfile');
const UserSession = require('./UserSession');
const CompanyModule = require('./CompanyModule');

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

module.exports = {
  Company,
  Branch,
  SystemModule,
  Role,
  User,
  UserProfile,
  UserSession,
  CompanyModule
};

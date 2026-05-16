const { User, Role, Company, Branch } = require('../models');
const { hashPassword } = require('../utils/password');
const { Op } = require('sequelize');

const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, company_id, branch_id, is_active } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { email: { [Op.like]: `%${search}%` } },
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (company_id) where.company_id = company_id;
    if (branch_id) where.branch_id = branch_id;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['password_hash'] },
      include: [
        { model: Role, as: 'role', attributes: ['id', 'name'] },
        { model: Company, as: 'company', attributes: ['id', 'name'] },
        { model: Branch, as: 'branch', attributes: ['id', 'name'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      users: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Error obteniendo usuarios' });
  }
};

const getById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        { model: Role, as: 'role' },
        { model: Company, as: 'company' },
        { model: Branch, as: 'branch' }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Error obteniendo usuario' });
  }
};

const create = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, role_id, company_id, branch_id } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      email,
      password_hash: passwordHash,
      first_name,
      last_name,
      phone,
      role_id,
      company_id: company_id || req.user.company_id,
      branch_id,
      is_active: true
    });

    const userWithRelations = await User.findByPk(user.id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        { model: Role, as: 'role' },
        { model: Company, as: 'company' },
        { model: Branch, as: 'branch' }
      ]
    });

    res.status(201).json({ user: userWithRelations });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Error creando usuario' });
  }
};

const update = async (req, res) => {
  try {
    const { email, first_name, last_name, phone, role_id, branch_id, is_active } = req.body;

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }
    }

    await user.update({
      email: email || user.email,
      first_name: first_name !== undefined ? first_name : user.first_name,
      last_name: last_name !== undefined ? last_name : user.last_name,
      phone: phone !== undefined ? phone : user.phone,
      role_id: role_id || user.role_id,
      branch_id: branch_id !== undefined ? branch_id : user.branch_id,
      is_active: is_active !== undefined ? is_active : user.is_active
    });

    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        { model: Role, as: 'role' },
        { model: Company, as: 'company' },
        { model: Branch, as: 'branch' }
      ]
    });

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Error actualizando usuario' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const isCurrentUser = req.userId === user.id || req.user.role.name === 'admin';
    
    if (isCurrentUser) {
      const isValid = await comparePassword(current_password, user.password_hash);
      if (!isValid) {
        return res.status(400).json({ error: 'Contraseña actual incorrecta' });
      }
    }

    const passwordHash = await hashPassword(new_password);
    await user.update({ password_hash: passwordHash });

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Error cambiando contraseña' });
  }
};

const remove = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await user.update({ is_active: false });

    res.json({ message: 'Usuario desactivado correctamente' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Error desactivando usuario' });
  }
};

const comparePassword = require('../utils/password').comparePassword;

module.exports = {
  getAll,
  getById,
  create,
  update,
  changePassword,
  remove
};
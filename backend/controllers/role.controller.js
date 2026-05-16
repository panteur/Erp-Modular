const { Role, User, Company, Branch } = require('../models');
const { Op } = require('sequelize');

const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, company_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    if (company_id) where.company_id = company_id;

    const { count, rows } = await Role.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        { model: Company, as: 'company', attributes: ['id', 'name'] },
        { model: Branch, as: 'branch', attributes: ['id', 'name'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      roles: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: 'Error obteniendo roles' });
  }
};

const getById = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id, {
      include: [
        { model: Company, as: 'company' },
        { model: Branch, as: 'branch' },
        { model: User, as: 'roleUsers', attributes: ['id', 'email', 'first_name', 'last_name'] }
      ]
    });

    if (!role) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    res.json({ role });
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({ error: 'Error obteniendo rol' });
  }
};

const create = async (req, res) => {
  try {
    const { name, description, permissions, company_id, branch_id } = req.body;

    const existingRole = await Role.findOne({ where: { name, company_id } });
    if (existingRole) {
      return res.status(400).json({ error: 'El nombre del rol ya existe en esta empresa' });
    }

    const role = await Role.create({
      name,
      description,
      permissions: permissions || {},
      company_id: company_id || req.user.company_id,
      branch_id: branch_id || null,
      is_active: true
    });

    const roleWithRelations = await Role.findByPk(role.id, {
      include: [
        { model: Company, as: 'company' },
        { model: Branch, as: 'branch' }
      ]
    });

    res.status(201).json({ role: roleWithRelations });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ error: 'Error creando rol' });
  }
};

const update = async (req, res) => {
  try {
    const { name, description, permissions, branch_id, is_active } = req.body;

    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    if (name && name !== role.name) {
      const existingRole = await Role.findOne({ 
        where: { name, company_id: role.company_id, id: { [Op.ne]: req.params.id } } 
      });
      if (existingRole) {
        return res.status(400).json({ error: 'El nombre del rol ya existe' });
      }
    }

    await role.update({
      name: name || role.name,
      description: description !== undefined ? description : role.description,
      permissions: permissions !== undefined ? permissions : role.permissions,
      branch_id: branch_id !== undefined ? branch_id : role.branch_id,
      is_active: is_active !== undefined ? is_active : role.is_active
    });

    const updatedRole = await Role.findByPk(role.id, {
      include: [
        { model: Company, as: 'company' },
        { model: Branch, as: 'branch' }
      ]
    });

    res.json({ role: updatedRole });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Error actualizando rol' });
  }
};

const remove = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    const usersWithRole = await User.count({ where: { role_id: role.id } });
    if (usersWithRole > 0) {
      return res.status(400).json({ error: 'No se puede eliminar, hay usuarios con este rol' });
    }

    await role.update({ is_active: false });

    res.json({ message: 'Rol desactivado correctamente' });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ error: 'Error eliminando rol' });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
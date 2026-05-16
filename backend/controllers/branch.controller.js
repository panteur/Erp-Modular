const { Branch, Company } = require('../models');
const { Op } = require('sequelize');

const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, company_id, is_active } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } }
      ];
    }
    if (company_id) where.company_id = company_id;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const { count, rows } = await Branch.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{ model: Company, as: 'company', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      branches: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({ error: 'Error obteniendo sucursales' });
  }
};

const getById = async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id, {
      include: [{ model: Company, as: 'company' }]
    });

    if (!branch) {
      return res.status(404).json({ error: 'Sucursal no encontrada' });
    }

    res.json({ branch });
  } catch (error) {
    console.error('Get branch error:', error);
    res.status(500).json({ error: 'Error obteniendo sucursal' });
  }
};

const create = async (req, res) => {
  try {
    const { name, code, address, phone, company_id } = req.body;

    if (code) {
      const existingBranch = await Branch.findOne({ where: { code } });
      if (existingBranch) {
        return res.status(400).json({ error: 'El código de sucursal ya existe' });
      }
    }

    const branch = await Branch.create({
      name,
      code,
      address,
      phone,
      company_id: company_id || req.user.company_id,
      is_active: true
    });

    const branchWithCompany = await Branch.findByPk(branch.id, {
      include: [{ model: Company, as: 'company' }]
    });

    res.status(201).json({ branch: branchWithCompany });
  } catch (error) {
    console.error('Create branch error:', error);
    res.status(500).json({ error: 'Error creando sucursal' });
  }
};

const update = async (req, res) => {
  try {
    const { name, code, address, phone, is_active } = req.body;

    const branch = await Branch.findByPk(req.params.id);
    if (!branch) {
      return res.status(404).json({ error: 'Sucursal no encontrada' });
    }

    if (code && code !== branch.code) {
      const existingBranch = await Branch.findOne({ where: { code, id: { [Op.ne]: req.params.id } } });
      if (existingBranch) {
        return res.status(400).json({ error: 'El código de sucursal ya existe' });
      }
    }

    await branch.update({
      name: name || branch.name,
      code: code !== undefined ? code : branch.code,
      address: address !== undefined ? address : branch.address,
      phone: phone !== undefined ? phone : branch.phone,
      is_active: is_active !== undefined ? is_active : branch.is_active
    });

    const updatedBranch = await Branch.findByPk(branch.id, {
      include: [{ model: Company, as: 'company' }]
    });

    res.json({ branch: updatedBranch });
  } catch (error) {
    console.error('Update branch error:', error);
    res.status(500).json({ error: 'Error actualizando sucursal' });
  }
};

const remove = async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id);
    if (!branch) {
      return res.status(404).json({ error: 'Sucursal no encontrada' });
    }

    await branch.update({ is_active: false });

    res.json({ message: 'Sucursal desactivada correctamente' });
  } catch (error) {
    console.error('Delete branch error:', error);
    res.status(500).json({ error: 'Error eliminando sucursal' });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
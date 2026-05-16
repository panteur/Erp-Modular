const { Category } = require('../models');
const { Op } = require('sequelize');

const getAll = async (req, res) => {
  try {
    const { type } = req.query;
    const where = { company_id: req.user.company_id };
    if (type) where.type = { [Op.in]: [type, 'both'] };

    const categories = await Category.findAll({ where, order: [['name', 'ASC']] });
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Error obteniendo categorías' });
  }
};

const getById = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, company_id: req.user.company_id }
    });
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Error obteniendo categoría' });
  }
};

const create = async (req, res) => {
  try {
    const { name, description, type } = req.body;
    const category = await Category.create({
      name, description, type: type || 'both',
      company_id: req.user.company_id
    });
    res.status(201).json({ category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Error creando categoría' });
  }
};

const update = async (req, res) => {
  try {
    const { name, description, type, is_active } = req.body;
    const category = await Category.findOne({
      where: { id: req.params.id, company_id: req.user.company_id }
    });
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });

    await category.update({
      name: name || category.name,
      description: description !== undefined ? description : category.description,
      type: type || category.type,
      is_active: is_active !== undefined ? is_active : category.is_active
    });
    res.json({ category });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Error actualizando categoría' });
  }
};

const remove = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, company_id: req.user.company_id }
    });
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
    await category.update({ is_active: false });
    res.json({ message: 'Categoría desactivada correctamente' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Error desactivando categoría' });
  }
};

module.exports = { getAll, getById, create, update, remove };

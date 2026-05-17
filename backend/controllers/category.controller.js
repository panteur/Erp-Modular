const { Category } = require('../models');
const { Op } = require('sequelize');

const getAll = async (req, res) => {
  try {
    const { type, parent_id } = req.query;
    const where = { company_id: req.user.company_id };
    if (type) where.type = { [Op.in]: [type, 'both'] };
    if (parent_id === 'null') where.parent_id = null;
    else if (parent_id) where.parent_id = parent_id;

    const categories = await Category.findAll({
      where,
      include: [
        { model: Category, as: 'parent', attributes: ['id', 'name'] },
        { model: Category, as: 'children', attributes: ['id', 'name'] }
      ],
      order: [['name', 'ASC']]
    });
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Error obteniendo categorías' });
  }
};

const getById = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, company_id: req.user.company_id },
      include: [
        { model: Category, as: 'parent', attributes: ['id', 'name'] },
        { model: Category, as: 'children', attributes: ['id', 'name'] }
      ]
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
    const { name, description, type, parent_id } = req.body;
    const category = await Category.create({
      name, description, type: type || 'both', parent_id: parent_id || null,
      company_id: req.user.company_id
    });
    const created = await Category.findByPk(category.id, {
      include: [
        { model: Category, as: 'parent', attributes: ['id', 'name'] },
        { model: Category, as: 'children', attributes: ['id', 'name'] }
      ]
    });
    res.status(201).json({ category: created });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Error creando categoría' });
  }
};

const update = async (req, res) => {
  try {
    const { name, description, type, parent_id, is_active } = req.body;
    const category = await Category.findOne({
      where: { id: req.params.id, company_id: req.user.company_id }
    });
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });

    await category.update({
      name: name || category.name,
      description: description !== undefined ? description : category.description,
      type: type || category.type,
      parent_id: parent_id !== undefined ? (parent_id || null) : category.parent_id,
      is_active: is_active !== undefined ? is_active : category.is_active
    });

    const updated = await Category.findByPk(category.id, {
      include: [
        { model: Category, as: 'parent', attributes: ['id', 'name'] },
        { model: Category, as: 'children', attributes: ['id', 'name'] }
      ]
    });
    res.json({ category: updated });
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

const getParents = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { company_id: req.user.company_id, parent_id: null },
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });
    res.json({ categories });
  } catch (error) {
    console.error('Get parent categories error:', error);
    res.status(500).json({ error: 'Error obteniendo categorías padre' });
  }
};

module.exports = { getAll, getById, create, update, remove, getParents };

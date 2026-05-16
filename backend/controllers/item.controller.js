const { Item, Category, Inventory, Branch } = require('../models');
const { Op } = require('sequelize');

const itemIncludes = [
  { model: Category, as: 'category', attributes: ['id', 'name'] }
];

const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, category_id, is_active } = req.query;
    const offset = (page - 1) * limit;
    const where = { company_id: req.user.company_id };

    if (type) where.type = type;
    if (category_id) where.category_id = category_id;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } },
        { barcode: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Item.findAndCountAll({
      where, limit: parseInt(limit), offset: parseInt(offset),
      include: itemIncludes,
      order: [['name', 'ASC']]
    });

    res.json({
      items: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(count / limit) }
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Error obteniendo items' });
  }
};

const getById = async (req, res) => {
  try {
    const item = await Item.findOne({
      where: { id: req.params.id, company_id: req.user.company_id },
      include: [...itemIncludes,
        { model: Inventory, as: 'stockEntries', include: [{ model: Branch, as: 'branch', attributes: ['id', 'name'] }] }
      ]
    });
    if (!item) return res.status(404).json({ error: 'Item no encontrado' });
    res.json({ item });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ error: 'Error obteniendo item' });
  }
};

const create = async (req, res) => {
  try {
    const { type, name, description, sku, barcode, category_id, unit, sale_price, cost_price, tax_rate, stock_min, stock_max } = req.body;

    if (type === 'product' && sku) {
      const existing = await Item.findOne({ where: { sku, company_id: req.user.company_id } });
      if (existing) return res.status(400).json({ error: 'El SKU ya está registrado' });
    }

    const item = await Item.create({
      type, name, description, sku, barcode, category_id,
      unit: unit || 'unidad',
      sale_price: sale_price || 0, cost_price: cost_price || 0,
      tax_rate: tax_rate !== undefined ? tax_rate : 19,
      stock_min: stock_min || 0, stock_max: stock_max || 0,
      company_id: req.user.company_id
    });

    const created = await Item.findByPk(item.id, { include: itemIncludes });
    res.status(201).json({ item: created });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Error creando item' });
  }
};

const update = async (req, res) => {
  try {
    const item = await Item.findOne({ where: { id: req.params.id, company_id: req.user.company_id } });
    if (!item) return res.status(404).json({ error: 'Item no encontrado' });

    const { type, name, description, sku, barcode, category_id, unit, sale_price, cost_price, tax_rate, stock_min, stock_max, is_active } = req.body;

    if (sku && sku !== item.sku) {
      const existing = await Item.findOne({ where: { sku, company_id: req.user.company_id, id: { [Op.ne]: item.id } } });
      if (existing) return res.status(400).json({ error: 'El SKU ya está registrado' });
    }

    await item.update({
      type: type || item.type, name: name || item.name,
      description: description !== undefined ? description : item.description,
      sku, barcode: barcode !== undefined ? barcode : item.barcode,
      category_id: category_id !== undefined ? category_id : item.category_id,
      unit: unit || item.unit,
      sale_price: sale_price !== undefined ? sale_price : item.sale_price,
      cost_price: cost_price !== undefined ? cost_price : item.cost_price,
      tax_rate: tax_rate !== undefined ? tax_rate : item.tax_rate,
      stock_min: stock_min !== undefined ? stock_min : item.stock_min,
      stock_max: stock_max !== undefined ? stock_max : item.stock_max,
      is_active: is_active !== undefined ? is_active : item.is_active
    });

    const updated = await Item.findByPk(item.id, { include: itemIncludes });
    res.json({ item: updated });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Error actualizando item' });
  }
};

const remove = async (req, res) => {
  try {
    const item = await Item.findOne({ where: { id: req.params.id, company_id: req.user.company_id } });
    if (!item) return res.status(404).json({ error: 'Item no encontrado' });
    await item.update({ is_active: false });
    res.json({ message: 'Item desactivado correctamente' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Error desactivando item' });
  }
};

module.exports = { getAll, getById, create, update, remove };

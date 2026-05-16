const { Inventory, Item, Category, Branch } = require('../models');
const { Op } = require('sequelize');

const getAll = async (req, res) => {
  try {
    const { branch_id, search, low_stock } = req.query;
    const where = {};

    if (branch_id) where.branch_id = branch_id;

    const itemWhere = { company_id: req.user.company_id };
    if (search) {
      itemWhere[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } }
      ];
    }

    const stock = await Inventory.findAll({
      where,
      include: [
        { model: Item, as: 'item', where: itemWhere, include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }] },
        { model: Branch, as: 'branch', attributes: ['id', 'name'] }
      ],
      order: [[{ model: Item, as: 'item' }, 'name', 'ASC']]
    });

    let filtered = stock.filter(s => s.item);

    if (low_stock === 'true') {
      filtered = filtered.filter(s => s.quantity <= s.item.stock_min);
    }

    res.json({ stock: filtered });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Error obteniendo inventario' });
  }
};

const getByItem = async (req, res) => {
  try {
    const stock = await Inventory.findAll({
      where: { item_id: req.params.itemId },
      include: [{ model: Branch, as: 'branch', attributes: ['id', 'name'] }]
    });
    res.json({ stock });
  } catch (error) {
    console.error('Get item stock error:', error);
    res.status(500).json({ error: 'Error obteniendo stock del item' });
  }
};

const adjust = async (req, res) => {
  try {
    const { item_id, branch_id, quantity } = req.body;

    const item = await Item.findOne({ where: { id: item_id, company_id: req.user.company_id } });
    if (!item) return res.status(404).json({ error: 'Item no encontrado' });

    const [stock, created] = await Inventory.findOrCreate({
      where: { item_id, branch_id },
      defaults: { item_id, branch_id, quantity: 0 }
    });

    await stock.update({ quantity });

    res.json({ stock });
  } catch (error) {
    console.error('Adjust inventory error:', error);
    res.status(500).json({ error: 'Error ajustando inventario' });
  }
};

module.exports = { getAll, getByItem, adjust };

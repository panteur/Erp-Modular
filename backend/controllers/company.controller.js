const { Company } = require('../models');

const getById = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id, {
      include: [{ model: Branch, as: 'branches' }]
    });

    if (!company) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    res.json({ company });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Error obteniendo empresa' });
  }
};

const update = async (req, res) => {
  try {
    const { name, nit, address, phone, email } = req.body;

    const company = await Company.findByPk(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    await company.update({ name, nit, address, phone, email });

    res.json({ company });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ error: 'Error actualizando empresa' });
  }
};

const getAll = async (req, res) => {
  try {
    const companies = await Company.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']]
    });

    res.json({ companies });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Error obteniendo empresas' });
  }
};

module.exports = {
  getById,
  update,
  getAll
};
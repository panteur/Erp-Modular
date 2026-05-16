const { SystemModule, CompanyModule } = require('../models');

const getAll = async (req, res) => {
  try {
    const modules = await SystemModule.findAll({
      order: [['order_index', 'ASC'], ['name', 'ASC']]
    });

    res.json({ modules });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ error: 'Error obteniendo módulos' });
  }
};

const getById = async (req, res) => {
  try {
    const module = await SystemModule.findByPk(req.params.id);
    if (!module) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }
    res.json({ module });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({ error: 'Error obteniendo módulo' });
  }
};

const toggle = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, company_id } = req.body;

    const module = await SystemModule.findByPk(id);
    if (!module) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    if (company_id) {
      const [companyModule, created] = await CompanyModule.findOrCreate({
        where: { company_id, module_id: id },
        defaults: { is_active: is_active !== undefined ? is_active : !module.is_active }
      });

      if (!created) {
        await companyModule.update({ is_active: is_active !== undefined ? is_active : !companyModule.is_active });
      }

      return res.json({ 
        company_module: companyModule,
        module 
      });
    }

    await module.update({ is_active: is_active !== undefined ? is_active : !module.is_active });

    res.json({ module });
  } catch (error) {
    console.error('Toggle module error:', error);
    res.status(500).json({ error: 'Error toggling módulo' });
  }
};

const getByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const companyModules = await CompanyModule.findAll({
      where: { company_id: companyId, is_active: true },
      include: [{ model: SystemModule, as: 'module' }]
    });

    const modules = companyModules.map(cm => cm.module);

    res.json({ modules });
  } catch (error) {
    console.error('Get company modules error:', error);
    res.status(500).json({ error: 'Error obteniendo módulos de empresa' });
  }
};

module.exports = {
  getAll,
  getById,
  toggle,
  getByCompany
};
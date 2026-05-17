const sequelize = require('./connection');
const { Category, Item, Inventory, Branch } = require('../models');

const seed = async () => {
  try {
    const companyId = 1;

    const existing = await Category.count({ where: { company_id: companyId } });
    if (existing > 0) {
      console.log('Ya existen categorías, saltando seed');
      process.exit(0);
    }

    // Categorías principales
    const electronicos = await Category.create({ company_id: companyId, name: 'Electrónicos', type: 'product', description: 'Productos electrónicos y tecnología' });
    const oficina = await Category.create({ company_id: companyId, name: 'Oficina', type: 'both', description: 'Artículos de oficina y papelería' });
    const limpieza = await Category.create({ company_id: companyId, name: 'Limpieza', type: 'product', description: 'Productos de limpieza e higiene' });
    const servicios = await Category.create({ company_id: companyId, name: 'Servicios Generales', type: 'service', description: 'Servicios varios' });

    // Subcategorías
    const computacion = await Category.create({ company_id: companyId, name: 'Computación', type: 'product', parent_id: electronicos.id, description: 'Computadores y accesorios' });
    const audio = await Category.create({ company_id: companyId, name: 'Audio y Video', type: 'product', parent_id: electronicos.id, description: 'Equipos de audio y video' });

    const papeleria = await Category.create({ company_id: companyId, name: 'Papelería', type: 'product', parent_id: oficina.id, description: 'Papeles, cuadernos, sobres' });
    const muebles = await Category.create({ company_id: companyId, name: 'Muebles', type: 'product', parent_id: oficina.id, description: 'Muebles de oficina' });

    const soporte = await Category.create({ company_id: companyId, name: 'Soporte Técnico', type: 'service', parent_id: servicios.id, description: 'Soporte técnico presencial y remoto' });
    const consultoria = await Category.create({ company_id: companyId, name: 'Consultoría', type: 'service', parent_id: servicios.id, description: 'Servicios de consultoría' });

    // Productos
    const products = [
      { name: 'Notebook Pro 15"', sku: 'NB-001', category_id: computacion.id, sale_price: 899990, cost_price: 650000, stock_min: 2, stock_max: 20, unit: 'unidad' },
      { name: 'Mouse Inalámbrico', sku: 'MS-001', category_id: computacion.id, sale_price: 24990, cost_price: 12000, stock_min: 10, stock_max: 100, unit: 'unidad' },
      { name: 'Teclado Mecánico', sku: 'KB-001', category_id: computacion.id, sale_price: 59990, cost_price: 32000, stock_min: 5, stock_max: 50, unit: 'unidad' },
      { name: 'Monitor 24" Full HD', sku: 'MN-001', category_id: computacion.id, sale_price: 199990, cost_price: 140000, stock_min: 3, stock_max: 30, unit: 'unidad' },
      { name: 'Audífonos Bluetooth', sku: 'AU-001', category_id: audio.id, sale_price: 34990, cost_price: 18000, stock_min: 5, stock_max: 50, unit: 'unidad' },
      { name: 'Parlante Portátil', sku: 'SP-001', category_id: audio.id, sale_price: 45990, cost_price: 25000, stock_min: 5, stock_max: 40, unit: 'unidad' },
      { name: 'Resma Papel Carta', sku: 'PAP-001', category_id: papeleria.id, sale_price: 8990, cost_price: 5000, stock_min: 20, stock_max: 200, unit: 'unidad' },
      { name: 'Cuaderno Universitario', sku: 'CUA-001', category_id: papeleria.id, sale_price: 3990, cost_price: 1800, stock_min: 30, stock_max: 300, unit: 'unidad' },
      { name: 'Escritorio Ejecutivo', sku: 'MUE-001', category_id: muebles.id, sale_price: 249990, cost_price: 180000, stock_min: 1, stock_max: 10, unit: 'unidad' },
      { name: 'Silla de Oficina Ergonómica', sku: 'SIL-001', category_id: muebles.id, sale_price: 349990, cost_price: 250000, stock_min: 2, stock_max: 15, unit: 'unidad' },
      { name: 'Cloro Gel 1L', sku: 'CLO-001', category_id: limpieza.id, sale_price: 2990, cost_price: 1200, stock_min: 20, stock_max: 100, unit: 'litro' },
      { name: 'Detergente Líquido 500ml', sku: 'DET-001', category_id: limpieza.id, sale_price: 3990, cost_price: 1800, stock_min: 20, stock_max: 100, unit: 'unidad' },
    ];

    // Servicios
    const services = [
      { name: 'Mantencion Notebook', category_id: soporte.id, sale_price: 45000, cost_price: 15000, unit: 'unidad', description: 'Limpieza y revisión general de notebook' },
      { name: 'Instalación Software', category_id: soporte.id, sale_price: 25000, cost_price: 5000, unit: 'unidad', description: 'Instalación de software y configuración' },
      { name: 'Consulta Tributaria', category_id: consultoria.id, sale_price: 80000, cost_price: 30000, unit: 'hora', description: 'Asesoría en materia tributaria' },
      { name: 'Auditoría TI', category_id: consultoria.id, sale_price: 150000, cost_price: 60000, unit: 'hora', description: 'Auditoría de sistemas y seguridad informática' },
      { name: 'Mantencion Oficina', category_id: servicios.id, sale_price: 35000, cost_price: 15000, unit: 'unidad', description: 'Mantencion general de instalaciones' },
    ];

    const createdProducts = await Item.bulkCreate(products.map(p => ({ ...p, type: 'product', company_id: companyId, tax_rate: 19 })));
    const createdServices = await Item.bulkCreate(services.map(s => ({ ...s, type: 'service', company_id: companyId, tax_rate: 19 })));

    // Stock inicial en sucursal 1
    const branch = await Branch.findOne({ where: { company_id: companyId, is_active: true } });
    if (branch) {
      const stockEntries = [
        { item_id: createdProducts[0].id, branch_id: branch.id, quantity: 5 },   // Notebook
        { item_id: createdProducts[1].id, branch_id: branch.id, quantity: 50 },  // Mouse
        { item_id: createdProducts[2].id, branch_id: branch.id, quantity: 30 },  // Teclado
        { item_id: createdProducts[3].id, branch_id: branch.id, quantity: 8 },   // Monitor
        { item_id: createdProducts[4].id, branch_id: branch.id, quantity: 25 },  // Audífonos
        { item_id: createdProducts[5].id, branch_id: branch.id, quantity: 15 },  // Parlante
        { item_id: createdProducts[8].id, branch_id: branch.id, quantity: 2 },   // Escritorio
        { item_id: createdProducts[9].id, branch_id: branch.id, quantity: 4 },   // Silla
      ];
      await Inventory.bulkCreate(stockEntries);
    }

    console.log('Seed de inventario completado');
    console.log(`  ${createdProducts.length} productos creados`);
    console.log(`  ${createdServices.length} servicios creados`);
    console.log(`  1${branch ? ' sucursal con stock inicial' : ''}`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seed();

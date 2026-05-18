const { Notification, User, Item, Branch } = require('../models');

async function seed() {
  const admin = await User.findOne({ where: { email: 'admin@miempresa.com' } });
  if (!admin) { console.log('Admin no encontrado'); process.exit(1); return; }

  await Notification.destroy({ where: { user_id: admin.id } });

  const items = await Item.findAll({ where: { company_id: admin.company_id }, limit: 3 });
  const branch = await Branch.findOne({ where: { company_id: admin.company_id } });
  const branchName = branch?.name || 'Sucursal Principal';

  const now = new Date();
  const notis = [
    { user_id: admin.id, type: 'low_stock', icon: '📦', title: 'Stock Bajo - Notebook', message: `Notebook Pro 15" tiene solo 2 unidades en ${branchName}. Mínimo: 5.`, related_type: 'item', related_id: items[0]?.id, created_at: new Date(now - 4 * 3600000) },
    { user_id: admin.id, type: 'low_stock', icon: '📦', title: 'Stock Bajo - Monitor', message: 'Monitor 24" Full HD tiene 1 unidad. Mínimo: 3.', related_type: 'item', related_id: items[1]?.id, created_at: new Date(now - 2 * 3600000) },
    { user_id: admin.id, type: 'low_stock', icon: '📦', title: 'Stock Bajo - Escritorio', message: 'Escritorio Ejecutivo tiene 0 unidades. Mínimo: 1.', related_type: 'item', related_id: items[2]?.id, created_at: new Date(now - 3600000) },
    { user_id: admin.id, type: 'system', icon: '🔔', title: 'Bienvenido al ERP Modular', message: 'Sistema de notificaciones activo. Recibirás alertas de stock bajo y otros eventos.', created_at: new Date(now - 6 * 3600000) },
    { user_id: admin.id, type: 'system', icon: '⚙️', title: 'Actualización del Sistema', message: 'Módulo de Inventario agregado con productos, servicios y stock.', created_at: new Date(now - 8 * 3600000) },
  ];

  for (const n of notis) {
    await Notification.create(n);
  }
  console.log(`${notis.length} notificaciones creadas para ${admin.email}`);
  process.exit(0);
}

seed().catch(e => { console.error(e.message); process.exit(1); });

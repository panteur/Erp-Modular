const { Notification, User } = require('../models');

const createNotification = async ({ user_id, type, title, message, icon, related_type, related_id }) => {
  try {
    await Notification.create({ user_id, type, title, message, icon, related_type, related_id });
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

const notifyLowStock = async (item, branch, quantity) => {
  const users = await User.findAll({
    where: { company_id: item.company_id, is_active: true }
  });

  for (const user of users) {
    await createNotification({
      user_id: user.id,
      type: 'low_stock',
      title: 'Stock Bajo',
      message: `"${item.name}" tiene ${quantity} unidades en ${branch.name}. Mínimo: ${item.stock_min}.`,
      icon: '📦',
      related_type: 'item',
      related_id: item.id
    });
  }
};

module.exports = { createNotification, notifyLowStock };

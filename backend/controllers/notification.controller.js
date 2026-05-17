const { Notification } = require('../models');
const { Op } = require('sequelize');

const getMine = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 50
    });
    const unreadCount = await Notification.count({
      where: { user_id: req.user.id, is_read: false }
    });
    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Error obteniendo notificaciones' });
  }
};

const markAsRead = async (req, res) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { id: req.params.id, user_id: req.user.id } }
    );
    res.json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    console.error('Mark notification error:', error);
    res.status(500).json({ error: 'Error marcando notificación' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { user_id: req.user.id, is_read: false } }
    );
    res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    console.error('Mark all notifications error:', error);
    res.status(500).json({ error: 'Error marcando notificaciones' });
  }
};

module.exports = { getMine, markAsRead, markAllAsRead };

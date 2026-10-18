import { pool } from '../config/db.js';

export async function getMyNotifications(req, res) {
  try {
    const [notifications] = await pool.query(
      `SELECT * FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 30`,
      [req.user.id]
    );

    const [unread] = await pool.query(
      'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [req.user.id]
    );

    return res.json({
      success: true,
      notifications,
      unread_count: unread[0].count
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
}

export async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
}

export async function markAllAsRead(req, res) {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [req.user.id]
    );

    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update notifications.' });
  }
}

const db = require('../config/db');

const Notification = {
    create: async (userId, senderId, type, relatedId = null) => {
        const sql = 'INSERT INTO notifications (user_id, sender_id, type, related_id) VALUES (?, ?, ?, ?)';
        const [result] = await db.execute(sql, [userId, senderId, type, relatedId]);
        return result.insertId;
    },

    getForUser: async (userId) => {
        const sql = `
            SELECT n.*, u.fullname AS sender_name, u.profile_picture AS sender_picture
            FROM notifications n
            JOIN users u ON n.sender_id = u.id
            WHERE n.user_id = ?
            ORDER BY n.created_at DESC
        `;
        const [rows] = await db.execute(sql, [userId]);
        return rows;
    },

    markAllRead: async (userId) => {
        const sql = 'UPDATE notifications SET is_read = 1 WHERE user_id = ?';
        const [result] = await db.execute(sql, [userId]);
        return result.affectedRows;
    },

    markRead: async (notificationId, userId) => {
        const sql = 'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?';
        const [result] = await db.execute(sql, [notificationId, userId]);
        return result.affectedRows > 0;
    },

    countUnread: async (userId) => {
        const sql = 'SELECT COUNT(*) AS unreadCount FROM notifications WHERE user_id = ? AND is_read = 0';
        const [rows] = await db.execute(sql, [userId]);
        return rows[0].unreadCount;
    }
};

module.exports = Notification;

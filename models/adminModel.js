const db = require('../config/db');

const Admin = {
    getAllUsers: async () => {
        const sql = 'SELECT id, fullname, email, profile_picture, created_at FROM users ORDER BY created_at DESC';
        const [rows] = await db.execute(sql);
        return rows;
    },

    deleteUser: async (userId) => {
        const sql = 'DELETE FROM users WHERE id = ?';
        const [result] = await db.execute(sql, [userId]);
        return result.affectedRows > 0;
    },

    deletePost: async (postId) => {
        const sql = 'DELETE FROM posts WHERE id = ?';
        const [result] = await db.execute(sql, [postId]);
        return result.affectedRows > 0;
    },

    getStatistics: async () => {
        const stats = {};

        const [users] = await db.execute('SELECT COUNT(*) as count FROM users');
        stats.totalUsers = users[0].count;

        const [posts] = await db.execute('SELECT COUNT(*) as count FROM posts');
        stats.totalPosts = posts[0].count;

        const [comments] = await db.execute('SELECT COUNT(*) as count FROM comments');
        stats.totalComments = comments[0].count;

        const [likes] = await db.execute('SELECT COUNT(*) as count FROM likes');
        stats.totalLikes = likes[0].count;

        const [messages] = await db.execute('SELECT COUNT(*) as count FROM messages');
        stats.totalMessages = messages[0].count;

        const [notifications] = await db.execute('SELECT COUNT(*) as count FROM notifications');
        stats.totalNotifications = notifications[0].count;

        return stats;
    }
};

module.exports = Admin;

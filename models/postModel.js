const db = require('../config/db');

const Post = {
    create: async (userId, content, image) => {
        const sql = 'INSERT INTO posts (user_id, content, image) VALUES (?, ?, ?)';
        const [result] = await db.execute(sql, [userId, content, image || null]);
        return result.insertId;
    },

    getAllWithAuthors: async (currentUserId) => {
        const sql = `
            SELECT posts.*, users.fullname, users.profile_picture,
            (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) as likes_count,
            (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id) as comments_count,
            (SELECT COUNT(*) FROM shares WHERE shares.post_id = posts.id) as shares_count,
            (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id AND likes.user_id = ?) as has_liked
            FROM posts 
            JOIN users ON posts.user_id = users.id 
            ORDER BY posts.created_at DESC
        `;
        const [rows] = await db.execute(sql, [currentUserId || 0]);
        return rows;
    },

    findById: async (id) => {
        const sql = 'SELECT * FROM posts WHERE id = ?';
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    },

    delete: async (id) => {
        const sql = 'DELETE FROM posts WHERE id = ?';
        const [result] = await db.execute(sql, [id]);
        return result.affectedRows > 0;
    },

    update: async (id, content) => {
        const sql = 'UPDATE posts SET content = ? WHERE id = ?';
        const [result] = await db.execute(sql, [content, id]);
        return result.affectedRows > 0;
    }
};

module.exports = Post;
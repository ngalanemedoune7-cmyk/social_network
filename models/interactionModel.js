const db = require('../config/db');

const Interaction = {
    // --- LIKES ---
    checkLike: async (postId, userId) => {
        const sql = 'SELECT * FROM likes WHERE post_id = ? AND user_id = ?';
        const [rows] = await db.execute(sql, [postId, userId]);
        return rows.length > 0;
    },
    addLike: async (postId, userId) => {
        await db.execute('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [postId, userId]);
    },
    removeLike: async (postId, userId) => {
        await db.execute('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [postId, userId]);
    },

    // --- COMMENTAIRES ---
    addComment: async (postId, userId, content) => {
        const [result] = await db.execute('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)', [postId, userId, content]);
        return result.insertId;
    },
    getCommentsByPost: async (postId) => {
        const sql = `
            SELECT comments.*, users.fullname, users.profile_picture 
            FROM comments 
            JOIN users ON comments.user_id = users.id 
            WHERE comments.post_id = ? 
            ORDER BY comments.created_at ASC
        `;
        const [rows] = await db.execute(sql, [postId]);
        return rows;
    },
    findCommentById: async (commentId) => {
        const [rows] = await db.execute('SELECT * FROM comments WHERE id = ?', [commentId]);
        return rows[0];
    },
    deleteComment: async (commentId) => {
        const [result] = await db.execute('DELETE FROM comments WHERE id = ?', [commentId]);
        return result.affectedRows > 0;
    },

    // --- PARTAGES ---
    addShare: async (postId, userId) => {
        await db.execute('INSERT INTO shares (post_id, user_id) VALUES (?, ?)', [postId, userId]);
    }
};

module.exports = Interaction;
const db = require('../config/db');

const Search = {
    searchUsers: async (keyword) => {
        if (!keyword || keyword.trim() === '') {
            return [];
        }
        const sql = `
            SELECT id, fullname, email, profile_picture
            FROM users
            WHERE fullname LIKE ? OR email LIKE ?
            LIMIT 20
        `;
        const searchTerm = `%${keyword}%`;
        const [rows] = await db.execute(sql, [searchTerm, searchTerm]);
        return rows;
    },

    searchPosts: async (keyword) => {
        if (!keyword || keyword.trim() === '') {
            return [];
        }
        const sql = `
            SELECT p.id, p.content, p.image, p.user_id, p.created_at, u.fullname, u.profile_picture,
                   (SELECT COUNT(*) FROM likes WHERE likes.post_id = p.id) as likes_count,
                   (SELECT COUNT(*) FROM comments WHERE comments.post_id = p.id) as comments_count
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.content LIKE ?
            ORDER BY p.created_at DESC
            LIMIT 20
        `;
        const searchTerm = `%${keyword}%`;
        const [rows] = await db.execute(sql, [searchTerm]);
        return rows;
    }
};

module.exports = Search;

const db = require('../config/db');

const Friend = {
    
    sendRequest: async (senderId, receiverId) => {
        
        const sql = 'INSERT INTO friends (user_id_1, user_id_2, status) VALUES (?, ?, "pending")';
        const [result] = await db.execute(sql, [senderId, receiverId]);
        return result.insertId;
    },

    
    getRelation: async (user1, user2) => {
        const sql = `
            SELECT * FROM friends 
            WHERE (user_id_1 = ? AND user_id_2 = ?) 
               OR (user_id_1 = ? AND user_id_2 = ?)
        `;
        const [rows] = await db.execute(sql, [user1, user2, user2, user1]);
        return rows[0];
    },

    
    acceptRequest: async (user1, user2) => {
        const sql = `
            UPDATE friends SET status = "accepted" 
            WHERE (user_id_1 = ? AND user_id_2 = ?) 
               OR (user_id_1 = ? AND user_id_2 = ?)
        `;
        const [result] = await db.execute(sql, [user1, user2, user2, user1]);
        return result.affectedRows > 0;
    },

    
    deleteRelation: async (user1, user2) => {
        const sql = `
            DELETE FROM friends 
            WHERE (user_id_1 = ? AND user_id_2 = ?) 
               OR (user_id_1 = ? AND user_id_2 = ?)
        `;
        const [result] = await db.execute(sql, [user1, user2, user2, user1]);
        return result.affectedRows > 0;
    },

    
    getFriendsList: async (userId) => {
        const sql = `
            SELECT users.id, users.fullname, users.profile_picture 
            FROM friends
            JOIN users ON (friends.user_id_1 = users.id OR friends.user_id_2 = users.id)
            WHERE (friends.user_id_1 = ? OR friends.user_id_2 = ?) 
            AND friends.status = 'accepted' 
            AND users.id != ?
        `;
        const [rows] = await db.execute(sql, [userId, userId, userId]);
        return rows;
    },

    
    getPendingRequests: async (userId) => {
        const sql = `
            SELECT f.id as friendship_id, users.id as user_id, users.fullname, users.profile_picture
            FROM friends f
            JOIN users ON f.user_id_1 = users.id
            WHERE f.user_id_2 = ? AND f.status = 'pending'
        `;
        const [rows] = await db.execute(sql, [userId]);
        return rows;
    }
};

module.exports = Friend;
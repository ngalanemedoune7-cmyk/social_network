const db = require('../config/db');

const MessageModel = {
    // Sauvegarde du message dans la base de données
    create: async (senderId, receiverId, message) => {
        const sql = 'INSERT INTO messages (sender_id, receiver_id, message, created_at) VALUES (?, ?, ?, NOW())';
        const [result] = await db.execute(sql, [senderId, receiverId, message]);
        return result.insertId;
    },
    // Récupération de l'historique de la conversation
    getConversation: async (userId1, userId2) => {
        const sql = 'SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC';
        const [rows] = await db.execute(sql, [userId1, userId2, userId2, userId1]);
        return rows;
    }
};
module.exports = MessageModel;
const MessageModel = require('../models/messageModel');

exports.getConversation = async (req, res) => {
    try {
        const friendId = req.params.friendId || req.params.receiverId;
        const conversations = await MessageModel.getConversation(req.session.userId, friendId);
        res.json(conversations);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la récupération des messages.' });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.session.userId;
        const { receiverId, message } = req.body;

        if (!receiverId || !message || String(message).trim() === '') {
            return res.status(400).json({ error: 'Message ou destinataire invalide.' });
        }

        const messageId = await MessageModel.create(senderId, receiverId, String(message).trim());
        return res.status(201).json({ messageId });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur lors de l\'envoi du message.' });
    }
};

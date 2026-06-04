const Friend = require('../models/friendModel');
const Notification = require('../models/notificationModel');
const notificationSocket = require('../sockets/messageSocket');


exports.sendFriendRequest = async (req, res) => {
    const senderId = req.session.userId;
    const receiverId = parseInt(req.params.userId);

    if (senderId === receiverId) {
        return res.status(400).json({ error: 'Vous ne pouvez pas vous ajouter vous-même.' });
    }

    try {
        const existing = await Friend.getRelation(senderId, receiverId);
        if (existing) {
            return res.status(400).json({ error: 'Une demande ou une amitié existe déjà entre vous.' });
        }

        await Friend.sendRequest(senderId, receiverId);
        const notificationId = await Notification.create(receiverId, senderId, 'friend_request', null);
        notificationSocket.notifyUser(receiverId, {
            id: notificationId,
            sender_id: senderId,
            sender_name: req.session.fullname || "Quelqu'un",
            type: 'friend_request',
            related_id: null,
            is_read: 0,
            message: 'Nouvelle demande d\'ami',
            created_at: new Date().toISOString()
        });

        return res.status(201).json({ message: 'Demande d\'ami envoyée avec succès !' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erreur lors de l\'envoi de la demande.' });
    }
};


exports.acceptFriendRequest = async (req, res) => {
    const currentUserId = req.session.userId;
    const targetUserId = req.params.userId;

    try {
        const success = await Friend.acceptRequest(currentUserId, targetUserId);
        if (!success) return res.status(404).json({ error: "Demande introuvable." });

        return res.status(200).json({ message: "Vous êtes maintenant amis !" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erreur lors de l'acceptation." });
    }
};


exports.removeFriend = async (req, res) => {
    const currentUserId = req.session.userId;
    const targetUserId = req.params.userId;

    try {
        const success = await Friend.deleteRelation(currentUserId, targetUserId);
        if (!success) return res.status(404).json({ error: "Relation introuvable." });

        return res.status(200).json({ message: "Relation retirée/supprimée avec succès." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erreur lors de la suppression." });
    }
};


exports.getFriendsDashboard = async (req, res) => {
    const userId = req.session.userId;
    try {
        const friends = await Friend.getFriendsList(userId);
        const requests = await Friend.getPendingRequests(userId);
        return res.status(200).json({ friends, requests });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erreur de chargement du tableau de bord d'amis." });
    }
};
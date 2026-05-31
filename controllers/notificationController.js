const Notification = require('../models/notificationModel');

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.getForUser(req.session.userId);
        return res.status(200).json(notifications);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erreur lors de la récupération des notifications.' });
    }
};

exports.markAllRead = async (req, res) => {
    try {
        await Notification.markAllRead(req.session.userId);
        return res.status(200).json({ message: 'Notifications marquées comme lues.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erreur lors de la mise à jour des notifications.' });
    }
};

exports.markRead = async (req, res) => {
    try {
        const updated = await Notification.markRead(req.params.id, req.session.userId);
        if (!updated) {
            return res.status(404).json({ error: 'Notification introuvable.' });
        }
        return res.status(200).json({ message: 'Notification marquée comme lue.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erreur lors de la mise à jour de la notification.' });
    }
};

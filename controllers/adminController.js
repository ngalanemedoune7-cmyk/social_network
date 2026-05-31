const Admin = require('../models/adminModel');

// Vérifier si l'utilisateur est admin (pour l'instant, on considère l'ID 1 comme admin)
const isAdmin = (userId) => userId === 1;

exports.getAllUsers = async (req, res) => {
    try {
        if (!isAdmin(req.session.userId)) {
            return res.status(403).json({ error: 'Accès refusé. Vous devez être administrateur.' });
        }
        const users = await Admin.getAllUsers();
        return res.status(200).json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs.' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        if (!isAdmin(req.session.userId)) {
            return res.status(403).json({ error: 'Accès refusé. Vous devez être administrateur.' });
        }
        const userId = req.params.userId;

        if (userId === req.session.userId) {
            return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' });
        }

        const deleted = await Admin.deleteUser(userId);
        if (!deleted) {
            return res.status(404).json({ error: 'Utilisateur introuvable.' });
        }

        return res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur.' });
    }
};

exports.deletePost = async (req, res) => {
    try {
        if (!isAdmin(req.session.userId)) {
            return res.status(403).json({ error: 'Accès refusé. Vous devez être administrateur.' });
        }
        const postId = req.params.postId;

        const deleted = await Admin.deletePost(postId);
        if (!deleted) {
            return res.status(404).json({ error: 'Publication introuvable.' });
        }

        return res.status(200).json({ message: 'Publication supprimée avec succès.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erreur lors de la suppression de la publication.' });
    }
};

exports.getStatistics = async (req, res) => {
    try {
        if (!isAdmin(req.session.userId)) {
            return res.status(403).json({ error: 'Accès refusé. Vous devez être administrateur.' });
        }
        const stats = await Admin.getStatistics();
        return res.status(200).json(stats);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques.' });
    }
};

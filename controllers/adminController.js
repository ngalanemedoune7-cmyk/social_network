const Admin = require('../models/adminModel');
const User = require('../models/userModel');

const isAdmin = async (req) => {
    if (req.session && req.session.role) {
        return req.session.role === 'admin';
    }

    if (req.session && req.session.userId) {
        const user = await User.findById(req.session.userId);
        return user && user.role === 'admin';
    }

    return false;
};

exports.getAllUsers = async (req, res) => {
    try {
        if (!(await isAdmin(req))) {
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
        if (!(await isAdmin(req))) {
            return res.status(403).json({ error: 'Accès refusé. Vous devez être administrateur.' });
        }
        const userId = req.params.userId;

        if (Number(userId) === Number(req.session.userId)) {
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
        if (!(await isAdmin(req))) {
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

exports.getAllPosts = async (req, res) => {
    try {
        if (!(await isAdmin(req))) {
            return res.status(403).json({ error: 'Accès refusé. Vous devez être administrateur.' });
        }
        const posts = await Admin.getAllPosts();
        return res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erreur lors de la récupération des publications.' });
    }
};

exports.getStatistics = async (req, res) => {
    try {
        if (!(await isAdmin(req))) {
            return res.status(403).json({ error: 'Accès refusé. Vous devez être administrateur.' });
        }
        const stats = await Admin.getStatistics();
        return res.status(200).json(stats);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques.' });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        if (!(await isAdmin(req))) {
            return res.status(403).json({ error: 'Accès refusé. Vous devez être administrateur.' });
        }

        const userId = req.params.userId;
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Rôle invalide.' });
        }

        if (Number(userId) === Number(req.session.userId)) {
            return res.status(400).json({ error: 'Vous ne pouvez pas changer votre propre rôle.' });
        }

        const updated = await Admin.updateUserRole(userId, role);
        if (!updated) {
            return res.status(404).json({ error: 'Utilisateur introuvable.' });
        }

        return res.status(200).json({ message: 'Rôle mis à jour avec succès.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erreur lors de la mise à jour du rôle.' });
    }
};


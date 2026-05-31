const Interaction = require('../models/interactionModel');
const Post = require('../models/postModel');
const Notification = require('../models/notificationModel');
const notificationSocket = require('../sockets/messageSocket');

exports.toggleLike = async (req, res) => {
    const postId = req.params.postId;
    const userId = req.session.userId;
    try {
        const hasLiked = await Interaction.checkLike(postId, userId);
        if (hasLiked) {
            await Interaction.removeLike(postId, userId);
            return res.status(200).json({ liked: false });
        } else {
            await Interaction.addLike(postId, userId);

            const post = await Post.findById(postId);
            if (post && post.user_id !== userId) {
                const notificationId = await Notification.create(post.user_id, userId, 'like', postId);
                notificationSocket.notifyUser(post.user_id, {
                    id: notificationId,
                    sender_id: userId,
                    sender_name: req.session.fullname || "Quelqu'un",
                    type: 'like',
                    related_id: postId,
                    is_read: 0,
                    message: "Nouvelle mention J'aime sur votre publication",
                    created_at: new Date().toISOString()
                });
            }
            return res.status(200).json({ liked: true });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erreur avec le like.' });
    }
};

// Ajouter un commentaire
exports.commentPost = async (req, res) => {
    const postId = req.params.postId;
    const userId = req.session.userId;
    const { content } = req.body;

    if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Le commentaire ne peut pas être vide.' });
    }
    try {
        const commentId = await Interaction.addComment(postId, userId, content.trim());

        const post = await Post.findById(postId);
        if (post && post.user_id !== userId) {
            const notificationId = await Notification.create(post.user_id, userId, 'comment', commentId);
            notificationSocket.notifyUser(post.user_id, {
                id: notificationId,
                sender_id: userId,
                sender_name: req.session.fullname || "Quelqu'un",
                type: 'comment',
                related_id: commentId,
                is_read: 0,
                message: "Nouveau commentaire sur votre publication",
                created_at: new Date().toISOString()
            });
        }

        return res.status(201).json({ message: 'Commentaire ajouté !' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erreur lors du commentaire.' });
    }
};

// Récupérer les commentaires d'un post
exports.getComments = async (req, res) => {
    try {
        const comments = await Interaction.getCommentsByPost(req.params.postId);
        return res.status(200).json(comments);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erreur de chargement des commentaires.' });
    }
};

// Supprimer son propre commentaire
exports.deleteComment = async (req, res) => {
    const commentId = req.params.commentId;
    const userId = req.session.userId;
    try {
        const comment = await Interaction.findCommentById(commentId);
        if (!comment) return res.status(404).json({ error: 'Commentaire introuvable.' });
        
        // Sécurité : Seul l'auteur du commentaire peut le supprimer
        if (comment.user_id !== userId) {
            return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos commentaires.' });
        }
        
        await Interaction.deleteComment(commentId);
        return res.status(200).json({ message: 'Commentaire supprimé.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erreur lors de la suppression du commentaire.' });
    }
};

// Partager une publication
exports.sharePost = async (req, res) => {
    const postId = req.params.postId;
    const userId = req.session.userId;
    try {
        await Interaction.addShare(postId, userId);
        return res.status(201).json({ message: 'Publication partagée sur votre profil !' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erreur lors du partage.' });
    }
};
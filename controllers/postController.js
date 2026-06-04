const Post = require('../models/postModel');


exports.createPost = async (req, res) => {
    const { content } = req.body;
    const userId = req.session.userId; 

    
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!content && !image) {
        return res.status(400).json({ error: "Une publication ne peut pas être vide." });
    }

    try {
        const postId = await Post.create(userId, content, image);
        return res.status(201).json({ message: "Publication partagée avec succès !", postId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erreur lors de la création de la publication." });
    }
};


exports.getTimeline = async (req, res) => {
    try {
        const posts = await Post.getAllWithAuthors(req.session.userId);
        return res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erreur lors du chargement du fil d'actualité." });
    }
};


exports.deletePost = async (req, res) => {
    const postId = req.params.id;
    const userId = req.session.userId;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Publication introuvable." });
        }

        
        if (post.user_id !== userId) {
            return res.status(403).json({ error: "Vous n'êtes pas autorisé à supprimer cette publication." });
        }

        await Post.delete(postId);
        return res.status(200).json({ message: "Publication supprimée." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erreur lors de la suppression." });
    }
}; 


exports.updatePost = async (req, res) => {
    const postId = req.params.id;
    const userId = req.session.userId;
    const { content } = req.body;

    if (!content || content.trim() === "") {
        return res.status(400).json({ error: "Le contenu ne peut pas être vide." });
    }

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Publication introuvable." });
        }

        
        if (post.user_id !== userId) {
            return res.status(403).json({ error: "Vous n'êtes pas autorisé à modifier cette publication." });
        }

        await Post.update(postId, content.trim());
        return res.status(200).json({ message: "Publication modifiée avec succès !" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erreur lors de la modification." });
    }
};
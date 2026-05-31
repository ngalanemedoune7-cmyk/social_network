const Search = require('../models/searchModel');

exports.searchUsers = async (req, res) => {
    try {
        const keyword = req.query.q || '';
        const users = await Search.searchUsers(keyword);
        return res.status(200).json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erreur lors de la recherche.' });
    }
};

exports.searchPosts = async (req, res) => {
    try {
        const keyword = req.query.q || '';
        const posts = await Search.searchPosts(keyword);
        return res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erreur lors de la recherche de publications.' });
    }
};

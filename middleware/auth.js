module.exports = {
    
    isLoggedIn: (req, res, next) => {
        if (req.session && req.session.userId) {
            return next();
        }
        return res.status(401).json({ error: "Accès refusé. Veuillez vous connecter." });
    },

    
    isLoggedOut: (req, res, next) => {
        if (!req.session || !req.session.userId) {
            return next();
        }
        return res.status(400).json({ error: "Vous êtes déjà connecté." });
    }
};
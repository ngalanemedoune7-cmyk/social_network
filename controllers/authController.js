const User = require('../models/userModel');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
    const { fullname, email, password } = req.body;

    
    if (!fullname || !email || !password) {
        return res.status(400).json({ error: "Tous les champs sont obligatoires." });
    }

    try {
        
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: "Cet email est déjà utilisé." });
        }

        
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        
        const profilePicture = req.file ? req.file.filename : null;

        
        await User.create(fullname, email, hashedPassword, profilePicture);

        return res.status(201).json({ message: "Inscription réussie ! Vous pouvez vous connecter." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erreur serveur lors de l'inscription." });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Veuillez remplir tous les champs." });
    }

    try {
        
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: "Identifiants incorrects." });
        }

        
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Identifiants incorrects." });
        }

        
        req.session.userId = user.id;
        req.session.fullname = user.fullname;
        req.session.role = user.role;

        return res.status(200).json({ 
            message: "Connexion réussie !",
            user: { id: user.id, fullname: user.fullname, email: user.email, profile_picture: user.profile_picture, role: user.role }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erreur serveur lors de la connexion." });
    }
};

exports.logout = (req, res) => {
    
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Impossible de vous déconnecter." });
        }
        res.clearCookie('connect.sid'); 
        return res.status(200).json({ message: "Déconnexion réussie." });
    });
};


exports.checkAuth = async (req, res) => {
    if (req.session && req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            req.session.role = user.role;
            return res.status(200).json({ loggedIn: true, user });
        } catch (error) {
            return res.status(500).json({ loggedIn: false });
        }
    }
    return res.status(200).json({ loggedIn: false });
};


exports.getCurrentUser = async (req, res) => {
    if (req.session && req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            return res.status(200).json({ id: user.id, username: user.fullname, email: user.email, role: user.role });
        } catch (error) {
            return res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur" });
        }
    }
    return res.status(401).json({ error: "Utilisateur non authentifié" });
};


exports.updateProfile = async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const { fullname, email, currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.session.userId;

    
    if (!fullname || !email) {
        return res.status(400).json({ error: "Le nom et l'email sont obligatoires." });
    }

    try {
        
        const user = await User.findByIdWithPassword(userId);
        if (!user) {
            return res.status(404).json({ error: "Utilisateur introuvable." });
        }

        
        if (email !== user.email) {
            const existingUser = await User.findByEmailExcludeId(email, userId);
            if (existingUser) {
                return res.status(400).json({ error: "Cet email est déjà utilisé." });
            }
        }

        
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ error: "Veuillez entrer votre mot de passe actuel." });
            }

            
            const passwordMatch = await bcrypt.compare(currentPassword, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ error: "Le mot de passe actuel est incorrect." });
            }

            
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ error: "Les nouveaux mots de passe ne correspondent pas." });
            }

            if (newPassword.length < 4) {
                return res.status(400).json({ error: "Le nouveau mot de passe doit contenir au moins 4 caractères." });
            }

            
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            await User.updatePassword(userId, hashedPassword);
        }

        
        const profilePicture = req.file ? req.file.filename : null;

        
        const updated = await User.updateProfile(userId, fullname, email, profilePicture);

        if (!updated) {
            return res.status(500).json({ error: "Impossible de mettre à jour le profil." });
        }

        
        req.session.fullname = fullname;

        
        const updatedUser = await User.findById(userId);

        return res.status(200).json({ 
            message: "Profil mis à jour avec succès.",
            user: { id: updatedUser.id, fullname: updatedUser.fullname, email: updatedUser.email, profile_picture: updatedUser.profile_picture }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erreur serveur lors de la mise à jour du profil." });
    }
};
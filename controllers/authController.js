const User = require('../models/userModel');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
    const { fullname, email, password } = req.body;

    // Validation basique des champs (Contrainte technique)
    if (!fullname || !email || !password) {
        return res.status(400).json({ error: "Tous les champs sont obligatoires." });
    }

    try {
        // 1. Vérifier si l'email existe déjà
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: "Cet email est déjà utilisé." });
        }

        // 2. Hachage du mot de passe (Sécurité imposée)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 3. Récupérer le nom du fichier image si présent (géré par Multer)
        const profilePicture = req.file ? req.file.filename : null;

        // 4. Création unique de l'utilisateur avec son avatar
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
        // Vérifier si l'utilisateur existe
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: "Identifiants incorrects." });
        }

        // Vérifier le mot de passe
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Identifiants incorrects." });
        }

        // Initialisation de la session (Gestion des sessions imposée)
        req.session.userId = user.id;
        req.session.fullname = user.fullname;

        return res.status(200).json({ 
            message: "Connexion réussie !",
            user: { id: user.id, fullname: user.fullname, email: user.email, profile_picture: user.profile_picture }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erreur serveur lors de la connexion." });
    }
};

exports.logout = (req, res) => {
    // Destruction de la session (Déconnexion)
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Impossible de vous déconnecter." });
        }
        res.clearCookie('connect.sid'); // Nom par défaut du cookie de session Express
        return res.status(200).json({ message: "Déconnexion réussie." });
    });
};

// Route de vérification de l'état de connexion pour le Frontend
exports.checkAuth = async (req, res) => {
    if (req.session && req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            return res.status(200).json({ loggedIn: true, user });
        } catch (error) {
            return res.status(500).json({ loggedIn: false });
        }
    }
    return res.status(200).json({ loggedIn: false });
};

// Route pour récupérer l'utilisateur actuellement connecté
exports.getCurrentUser = async (req, res) => {
    if (req.session && req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            return res.status(200).json({ id: user.id, username: user.fullname, email: user.email });
        } catch (error) {
            return res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur" });
        }
    }
    return res.status(401).json({ error: "Utilisateur non authentifié" });
};

// Mettre à jour le profil utilisateur
exports.updateProfile = async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const { fullname, email, currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.session.userId;

    // Validation basique
    if (!fullname || !email) {
        return res.status(400).json({ error: "Le nom et l'email sont obligatoires." });
    }

    try {
        // Récupérer l'utilisateur actuel
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "Utilisateur introuvable." });
        }

        // Vérifier l'email n'est pas déjà utilisé par un autre utilisateur
        if (email !== user.email) {
            const existingUser = await User.findByEmailExcludeId(email, userId);
            if (existingUser) {
                return res.status(400).json({ error: "Cet email est déjà utilisé." });
            }
        }

        // Vérifier et mettre à jour le mot de passe si demandé
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ error: "Veuillez entrer votre mot de passe actuel." });
            }

            // Vérifier l'ancien mot de passe
            const passwordMatch = await bcrypt.compare(currentPassword, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ error: "Le mot de passe actuel est incorrect." });
            }

            // Vérifier que newPassword et confirmPassword correspondent
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ error: "Les nouveaux mots de passe ne correspondent pas." });
            }

            if (newPassword.length < 4) {
                return res.status(400).json({ error: "Le nouveau mot de passe doit contenir au moins 4 caractères." });
            }

            // Hacher le nouveau mot de passe
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            await User.updatePassword(userId, hashedPassword);
        }

        // Récupérer le nom du fichier image si présent (géré par Multer)
        const profilePicture = req.file ? req.file.filename : null;

        // Mettre à jour le profil
        const updated = await User.updateProfile(userId, fullname, email, profilePicture);

        if (!updated) {
            return res.status(500).json({ error: "Impossible de mettre à jour le profil." });
        }

        // Mettre à jour la session
        req.session.fullname = fullname;

        // Récupérer et retourner l'utilisateur mis à jour
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
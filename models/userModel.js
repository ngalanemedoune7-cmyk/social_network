const db = require('../config/db');

const User = {
  // Créer un nouvel utilisateur (Inscription avec photo de profil optionnelle)
    create: async (fullname, email, hashedPassword, profilePicture) => {
        const sql = 'INSERT INTO users (fullname, email, password, profile_picture) VALUES (?, ?, ?, ?)';
        // Si aucune image n'est envoyée, MySQL utilisera la valeur par défaut définie dans la table
        const img = profilePicture ? `/uploads/${profilePicture}` : 'default_profile.png';
        const [result] = await db.execute(sql, [fullname, email, hashedPassword, img]);
        return result.insertId;
    },

    // Trouver un utilisateur par son email (Connexion / Vérification)
    findByEmail: async (email) => {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await db.execute(sql, [email]);
        return rows[0]; // Retourne l'utilisateur trouvé ou undefined
    },

    // Trouver un utilisateur par son ID (Pour les profils et sessions)
    findById: async (id) => {
        const sql = 'SELECT id, fullname, email, profile_picture, created_at FROM users WHERE id = ?';
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    },

    // Mettre à jour le profil utilisateur (fullname, email, photo de profil)
    updateProfile: async (id, fullname, email, profilePicture) => {
        let sql = 'UPDATE users SET fullname = ?, email = ?';
        let params = [fullname, email];
        
        if (profilePicture) {
            sql += ', profile_picture = ?';
            params.push(`/uploads/${profilePicture}`);
        }
        
        sql += ' WHERE id = ?';
        params.push(id);
        
        const [result] = await db.execute(sql, params);
        return result.affectedRows > 0;
    },

    // Mettre à jour le mot de passe utilisateur
    updatePassword: async (id, hashedPassword) => {
        const sql = 'UPDATE users SET password = ? WHERE id = ?';
        const [result] = await db.execute(sql, [hashedPassword, id]);
        return result.affectedRows > 0;
    },

    // Vérifier que l'email n'est pas déjà utilisé (pour l'édition)
    findByEmailExcludeId: async (email, userId) => {
        const sql = 'SELECT id FROM users WHERE email = ? AND id != ?';
        const [rows] = await db.execute(sql, [email, userId]);
        return rows[0];
    }
};

module.exports = User;
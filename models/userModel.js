const db = require('../config/db');

const User = {
  
    create: async (fullname, email, hashedPassword, profilePicture) => {
        
        const [adminCountRows] = await db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
        const role = adminCountRows[0].count === 0 ? 'admin' : 'user';
        const img = profilePicture ? `/uploads/${profilePicture}` : 'default_profile.png';
        const sql = 'INSERT INTO users (fullname, email, password, profile_picture, role) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.execute(sql, [fullname, email, hashedPassword, img, role]);
        return result.insertId;
    },

    
    findByEmail: async (email) => {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await db.execute(sql, [email]);
        return rows[0]; 
    },

    
    findById: async (id) => {
        const sql = 'SELECT id, fullname, email, profile_picture, role, created_at FROM users WHERE id = ?';
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    },

    
    findByIdWithPassword: async (id) => {
        const sql = 'SELECT * FROM users WHERE id = ?';
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    },

    
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

    
    updatePassword: async (id, hashedPassword) => {
        const sql = 'UPDATE users SET password = ? WHERE id = ?';
        const [result] = await db.execute(sql, [hashedPassword, id]);
        return result.affectedRows > 0;
    },

    
    findByEmailExcludeId: async (email, userId) => {
        const sql = 'SELECT id FROM users WHERE email = ? AND id != ?';
        const [rows] = await db.execute(sql, [email, userId]);
        return rows[0];
    }
};

module.exports = User;
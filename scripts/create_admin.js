const db = require('../config/db');
const bcrypt = require('bcrypt');

(async () => {
  try {
    const fullname = 'Admin User';
    const email = 'admin@example.com';
    const password = 'Admin1234!';

    const [existing] = await db.execute('SELECT id, fullname, email, role FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      const user = existing[0];
      if (user.role === 'admin') {
        console.log('Admin account already exists:', user);
      } else {
        console.log('A user with the admin email already exists and is not an admin:', user);
        console.log('If you want to promote this account, update its role in the database.');
      }
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (fullname, email, password, profile_picture, role) VALUES (?, ?, ?, ?, ?)',
      [fullname, email, hashedPassword, '/uploads/default_profile.png', 'admin']
    );

    console.log('Created dedicated admin account:');
    console.log({ id: result.insertId, fullname, email, role: 'admin', password });
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin account:', error);
    process.exit(1);
  }
})();

const db = require('../config/db');

function getTargetFromArgs() {
  const arg = process.argv[2];
  if (!arg) {
    console.log('Usage: node scripts/transfer_admin.js <email-ou-id>');
    console.log('Exemple: node scripts/transfer_admin.js admin@example.com');
    process.exit(1);
  }
  return arg;
}

(async () => {
  try {
    const target = getTargetFromArgs();
    const isId = /^\d+$/.test(target);
    const lookupSql = isId
      ? 'SELECT id, fullname, email, role FROM users WHERE id = ?'
      : 'SELECT id, fullname, email, role FROM users WHERE email = ?';

    const [users] = await db.execute(lookupSql, [target]);
    if (users.length === 0) {
      console.error('Aucun utilisateur trouve pour:', target);
      process.exit(1);
    }

    const user = users[0];
    await db.execute('UPDATE users SET role = ? WHERE id = ?', ['admin', user.id]);

    const [admins] = await db.query('SELECT id, fullname, email, role, created_at FROM users WHERE role = ?', ['admin']);
    console.log('Utilisateur promu administrateur:', {
      id: user.id,
      fullname: user.fullname,
      email: user.email
    });
    console.log('Administrateurs actuels:', JSON.stringify(admins, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
})();

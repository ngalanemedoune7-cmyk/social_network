const db = require('../config/db');
(async()=>{
  try{
    await db.execute('UPDATE users SET role=? WHERE role=?',['user','admin']);
    const [res] = await db.execute('UPDATE users SET role=? WHERE id=?',['admin',2]);
    const [admins] = await db.query('SELECT id,fullname,email,role,created_at FROM users WHERE role=?',['admin']);
    console.log('Promoted affectedRows:', res.affectedRows);
    console.log('Admins:', JSON.stringify(admins, null, 2));
    process.exit(0);
  }catch(e){
    console.error('Error:', e.message);
    process.exit(1);
  }
})();

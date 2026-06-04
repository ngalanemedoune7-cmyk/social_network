const db = require('../config/db');
const bcrypt = require('bcrypt');
const ioClient = require('socket.io-client');

async function ensureTwoUsers() {
  const [rows] = await db.query('SELECT id FROM users LIMIT 2');
  if (rows.length >= 2) return rows.map(r => r.id);
  const ids = rows.map(r => r.id);
  while (ids.length < 2) {
    const fullname = 'testuser_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const email = fullname + '@example.com';
    const password = 'test1234';
    const hashed = await bcrypt.hash(password, 10);
    const [res] = await db.execute('INSERT INTO users (fullname, email, password, profile_picture, role) VALUES (?, ?, ?, ?, ?)', [fullname, email, hashed, '/uploads/default_profile.png', 'user']);
    ids.push(res.insertId);
  }
  return ids;
}

async function main() {
  try {
    const ids = await ensureTwoUsers();
    const [aId, bId] = ids;
    console.log('Using user IDs:', aId, bId);

    const c1 = ioClient('http://localhost:3000');
    const c2 = ioClient('http://localhost:3000');

    let c1Ready = false, c2Ready = false;
    let c1Got = false, c2Got = false;

    c1.on('connect', () => {
      console.log('c1 connected');
      c1.emit('register_user', aId);
    });
    c2.on('connect', () => {
      console.log('c2 connected');
      c2.emit('register_user', bId);
    });

    c1.on('receive_private_message', (data) => {
      console.log('c1 receive_private_message', data);
      if (data && data.self) c1Got = true;
      else c1Got = true;
    });
    c2.on('receive_private_message', (data) => {
      console.log('c2 receive_private_message', data);
      c2Got = true;
    });

    c1.on('new_notification', (n) => console.log('c1 new_notification', n));
    c2.on('new_notification', (n) => console.log('c2 new_notification', n));

    // Wait for both to connect then send
    const waitForReady = () => new Promise((resolve) => {
      let readyCount = 0;
      const ok = () => {
        readyCount++;
        if (readyCount === 2) resolve();
      };
      c1.on('connect', ok);
      c2.on('connect', ok);
    });

    await waitForReady();
    console.log('Both clients registered, sending message from A -> B');

    c1.emit('send_private_message', { senderId: aId, receiverId: bId, message: 'Salut depuis le test !' });

    // wait up to 6s for receipts
    await new Promise(r => setTimeout(r, 6000));

    console.log('Results: c1Got=', c1Got, 'c2Got=', c2Got);
    c1.close();
    c2.close();
    process.exit((c1Got && c2Got) ? 0 : 1);
  } catch (e) {
    console.error('Test error', e);
    process.exit(2);
  }
}

main();

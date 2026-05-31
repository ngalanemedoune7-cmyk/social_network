const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'social_network_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Utilisation des Promises pour pouvoir utiliser async/await dans nos modèles
const promisePool = pool.promise();

const createNotificationsTable = `
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    sender_id INT NOT NULL,
    type ENUM('like', 'comment', 'friend_request', 'message') NOT NULL,
    related_id INT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
`;

promisePool.query(createNotificationsTable).catch((error) => {
    console.error('Erreur création table notifications :', error);
});

module.exports = promisePool;
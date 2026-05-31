const express = require('express');
const session = require('express-session');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server); // Initialisation de io ici

// Importation et exécution du fichier socket
const messageSocket = require('./sockets/messageSocket');
messageSocket.initSocket(io);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_temporaire',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }
}));

// Fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const friendRoutes = require('./routes/friendRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const searchRoutes = require('./routes/searchRoutes');
const adminRoutes = require('./routes/adminRoutes');
const viewRoutes = require('./routes/viewRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);

app.use('/', viewRoutes);

app.get('/', (req, res) => {
    res.redirect('/posts/timeline');
});

// Lancement du serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
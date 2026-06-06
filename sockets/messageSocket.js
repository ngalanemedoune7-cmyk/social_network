const MessageModel = require('../models/messageModel');
const NotificationModel = require('../models/notificationModel');
const User = require('../models/userModel');

let io;
const activeUsers = new Map();

function notifyUser(userId, notification) {
    if (!io) return;
    const normalizedUserId = Number(userId);
    io.to(`user_${normalizedUserId}`).emit('new_notification', notification);
}

function broadcastOnlineUsers() {
    if (!io) return;
    io.emit('update_online_users', Array.from(activeUsers.entries()).map(([id, user]) => ({
        id,
        fullname: user.fullname
    })));
}

function initSocket(socketIo) {
    io = socketIo;

    io.on('connection', (socket) => {
        socket.on('register_user', async (userId) => {
            try {
                const normalizedUserId = Number(userId);
                if (!normalizedUserId) return;

                const user = await User.findById(normalizedUserId);
                socket.join(`user_${normalizedUserId}`);
                activeUsers.set(normalizedUserId, {
                    socketId: socket.id,
                    fullname: user ? user.fullname : `Utilisateur ${normalizedUserId}`
                });
                broadcastOnlineUsers();
            } catch (error) {
                console.error('Erreur enregistrement socket utilisateur :', error.message);
                socket.emit('message_error', { error: 'Connexion temps réel indisponible.' });
            }
        });

        socket.on('send_private_message', async (data) => {
            try {
                if (!data || !data.senderId || !data.receiverId || !data.message) return;

                const senderId = Number(data.senderId);
                const receiverId = Number(data.receiverId);
                const text = String(data.message).trim();
                if (!text) return;

                const messageId = await MessageModel.create(senderId, receiverId, text);
                const sender = await User.findById(senderId);
                const notificationId = await NotificationModel.create(receiverId, senderId, 'message', messageId);

                io.to(`user_${receiverId}`).emit('receive_private_message', {
                    senderId,
                    receiverId,
                    message: text,
                    timestamp: new Date().toISOString()
                });

                io.to(`user_${senderId}`).emit('receive_private_message', {
                    senderId,
                    receiverId,
                    message: text,
                    timestamp: new Date().toISOString(),
                    self: true
                });

                notifyUser(receiverId, {
                    id: notificationId,
                    sender_id: senderId,
                    sender_name: sender ? sender.fullname : 'Quel\'un',
                    type: 'message',
                    related_id: messageId,
                    is_read: 0,
                    message: `Nouveau message de ${sender ? sender.fullname : 'un ami'}`,
                    created_at: new Date().toISOString()
                });
            } catch (err) {
                socket.emit('message_error', { error: 'Erreur lors de l\'envoi du message.' });
            }
        });

        socket.on('disconnect', () => {
            for (const [userId, user] of activeUsers.entries()) {
                if (user.socketId === socket.id) {
                    activeUsers.delete(userId);
                    break;
                }
            }
            broadcastOnlineUsers();
        });
    });
}

module.exports = {
    initSocket,
    notifyUser,
    getActiveUsers: () => Array.from(activeUsers.entries()).map(([id, user]) => ({ id, fullname: user.fullname }))
};

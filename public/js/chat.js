const socket = window.socket || io();
window.socket = socket;
let currentUserId = null;
let selectedFriendId = null;

async function getCurrentUser() {
    try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
            const user = await response.json();
            currentUserId = user.id;
            socket.emit('register_user', Number(currentUserId));
        }
    } catch (err) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    getCurrentUser();

    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('messages-container');
    const onlineUsersList = document.getElementById('online-users-list');
    const chatHeader = document.querySelector('.chat-header');

    if (chatHeader) {
        chatHeader.addEventListener('click', () => {
            if (chatBox) chatBox.style.display = 'none';
            selectedFriendId = null;
            if (messagesContainer) messagesContainer.innerHTML = '';
        });
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.value.trim() !== '' && selectedFriendId) {
                const message = e.target.value;

                socket.emit('send_private_message', {
                    senderId: Number(currentUserId),
                    receiverId: Number(selectedFriendId),
                    message: message
                });

                const div = document.createElement('div');
                div.className = 'message-item own-message';
                div.innerHTML = `<strong>Vous:</strong> ${message}`;
                if (messagesContainer) {
                    messagesContainer.appendChild(div);
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
                e.target.value = '';
            }
        });
    }

    socket.on('receive_private_message', (data) => {
        if (chatBox) chatBox.style.display = 'block';
        const div = document.createElement('div');
        div.className = 'message-item other-message';
        div.innerHTML = `<strong>Ami:</strong> ${data && data.message ? data.message : ''}`;
        if (messagesContainer) {
            messagesContainer.appendChild(div);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    });

    socket.on('update_online_users', (users) => {
        if (!onlineUsersList) return;
        onlineUsersList.innerHTML = '';
        users.forEach(userId => {
            if (Number(userId) !== Number(currentUserId)) {
                const userDiv = document.createElement('div');
                userDiv.className = 'online-user';
                userDiv.innerHTML = `
                    <span class="user-online-indicator"></span>
                    <span class="user-name">${userId}</span>
                `;
                userDiv.style.cursor = 'pointer';
                userDiv.style.padding = '10px';
                userDiv.style.borderBottom = '1px solid #eee';
                userDiv.addEventListener('click', () => {
                    selectedFriendId = Number(userId);
                    if (chatBox) chatBox.style.display = 'block';
                    const header = document.querySelector('.chat-header');
                    if (header) header.textContent = `Chat avec ${userId} ✖`;
                    loadConversation(currentUserId, userId);
                    chatInput && chatInput.focus();
                });
                onlineUsersList.appendChild(userDiv);
            }
        });
    });

    socket.on('message_error', (data) => {
        alert('Erreur: ' + (data && data.error ? data.error : 'Erreur inconnue'));
    });
});

window.openChatWithFriend = async function (friendId, friendName) {
    selectedFriendId = Number(friendId);

    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    const chatHeader = document.querySelector('.chat-header');

    if (!chatBox || !chatInput || !chatHeader) return;

    chatBox.style.display = 'block';
    chatHeader.textContent = `Chat avec ${friendName} ✖`;
    chatInput.focus();
    await loadConversation(currentUserId, friendId);
};

async function loadConversation(userId1, userId2) {
    try {
        const response = await fetch(`/api/messages/conversation/${userId2}`);
        if (!response.ok) return;

        const messages = await response.json();
        const messagesContainer = document.getElementById('messages-container');
        if (!messagesContainer) return;

        messagesContainer.innerHTML = '';

        messages.forEach(msg => {
            const div = document.createElement('div');
            const isOwnMessage = Number(msg.sender_id) === Number(currentUserId);
            div.className = isOwnMessage ? 'message-item own-message' : 'message-item other-message';
            div.innerHTML = `<strong>${isOwnMessage ? 'Vous' : 'Ami'}:</strong> ${msg.message}`;
            messagesContainer.appendChild(div);
        });

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (err) {
        console.error('Erreur lors du chargement de la conversation:', err);
    }
}


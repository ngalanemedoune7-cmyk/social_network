const socket = window.socket || io();
window.socket = socket;

let currentUserId = null;
let selectedFriendId = null;
let selectedFriendName = 'Ami';

function safeText(value = '') {
    return String(value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[char]));
}

async function getCurrentUser() {
    try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
            const user = await response.json();
            currentUserId = user.id;
            socket.emit('register_user', Number(currentUserId));
        }
    } catch (error) {
        console.error("Erreur lors de la recuperation de l'utilisateur :", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    getCurrentUser();

    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('messages-container');
    const onlineUsersList = document.getElementById('online-users-list');
    const chatHeader = document.querySelector('.chat-header');
    const emojiBtn = document.getElementById('emoji-btn');
    const emojiPanel = document.getElementById('emoji-panel');
    const fileBtn = document.getElementById('file-btn');
    const fileInput = document.getElementById('chat-file-input');

    socket.on('connect', () => {
        if (currentUserId) socket.emit('register_user', Number(currentUserId));
    });

    chatHeader.addEventListener('click', () => {
        chatBox.style.display = 'none';
        selectedFriendId = null;
        messagesContainer.innerHTML = '';
    });

    chatInput.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' || !event.target.value.trim() || !selectedFriendId) return;
        sendChatMessage(event.target.value.trim());
        event.target.value = '';
    });

    if (emojiBtn && emojiPanel) {
        emojiBtn.addEventListener('click', () => {
            emojiPanel.classList.toggle('hidden');
            chatInput.focus();
        });

        emojiPanel.addEventListener('click', (event) => {
            const emojiButton = event.target.closest('[data-emoji]');
            if (!emojiButton) return;
            insertAtCursor(chatInput, emojiButton.dataset.emoji);
            chatInput.focus();
        });
    }

    if (fileBtn && fileInput) {
        fileBtn.addEventListener('click', () => {
            if (!selectedFriendId) {
                alert('Ouvrez une conversation avant de joindre un fichier.');
                return;
            }
            fileInput.click();
        });

        fileInput.addEventListener('change', () => {
            const file = fileInput.files[0];
            if (!file) return;
            const size = file.size >= 1024 * 1024
                ? `${(file.size / (1024 * 1024)).toFixed(1)} Mo`
                : `${Math.max(1, Math.round(file.size / 1024))} Ko`;
            sendChatMessage(`[Fichier] ${file.name} (${size})`);
            fileInput.value = '';
        });
    }

    socket.on('receive_private_message', (data) => {
        if (!data || data.self) return;
        if (Number(data.senderId) !== Number(selectedFriendId)) {
            selectedFriendId = Number(data.senderId);
            selectedFriendName = 'Ami';
        }
        chatBox.style.display = 'block';
        chatHeader.textContent = `Chat avec ${selectedFriendName} x`;
        appendMessage(selectedFriendName, data.message, false);
    });

    socket.on('update_online_users', (users) => {
        onlineUsersList.innerHTML = '';
        const others = (users || []).filter((user) => Number(user.id || user) !== Number(currentUserId));
        if (!others.length) {
            onlineUsersList.innerHTML = '<p class="muted">Aucun utilisateur en ligne.</p>';
            return;
        }
        others.forEach((user) => {
            const userId = user.id || user;
            const fullname = user.fullname || `Utilisateur ${userId}`;
            const row = document.createElement('button');
            row.type = 'button';
            row.className = 'online-user';
            row.innerHTML = `<span class="user-online-indicator"></span><span class="user-name">${safeText(fullname)}</span>`;
            row.addEventListener('click', () => window.openChatWithFriend(userId, fullname));
            onlineUsersList.appendChild(row);
        });
    });

    socket.on('message_error', (data) => {
        alert(data && data.error ? data.error : "Erreur lors de l'envoi du message.");
    });
});

window.openChatWithFriend = async function (friendId, friendName) {
    selectedFriendId = Number(friendId);
    selectedFriendName = friendName || 'Ami';

    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    const chatHeader = document.querySelector('.chat-header');

    chatBox.style.display = 'block';
    chatHeader.textContent = `Chat avec ${selectedFriendName} x`;
    chatInput.focus();
    await loadConversation(friendId);
};

async function loadConversation(friendId) {
    const response = await fetch(`/api/messages/conversation/${friendId}`);
    if (!response.ok) return;
    const messages = await response.json();
    const messagesContainer = document.getElementById('messages-container');
    messagesContainer.innerHTML = '';
    messages.forEach((message) => {
        const isOwn = Number(message.sender_id) === Number(currentUserId);
        appendMessage(isOwn ? 'Vous' : selectedFriendName, message.message, isOwn);
    });
}

function appendMessage(author, message, isOwn) {
    const messagesContainer = document.getElementById('messages-container');
    const item = document.createElement('div');
    item.className = `message-item ${isOwn ? 'own-message' : 'other-message'}`;
    item.innerHTML = `<strong>${safeText(author)}:</strong> ${safeText(message)}`;
    messagesContainer.appendChild(item);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendChatMessage(message) {
    if (!selectedFriendId) {
        alert('Selectionnez un ami ou un utilisateur en ligne avant d envoyer un message.');
        return;
    }

    socket.emit('send_private_message', {
        senderId: Number(currentUserId),
        receiverId: Number(selectedFriendId),
        message
    });
    appendMessage('Vous', message, true);
}

function insertAtCursor(input, value) {
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    input.value = `${input.value.slice(0, start)}${value}${input.value.slice(end)}`;
    const position = start + value.length;
    input.setSelectionRange(position, position);
}

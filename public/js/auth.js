let currentUser = null;
let notificationSocketInitialized = false;
let timelinePostsCache = [];
let friendIdsCache = new Set();
let activeFeedFilter = 'all';

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
}[char]));

const avatarSrc = (path) => {
    if (!path) return '/images/default-avatar.svg';
    return path.startsWith('/uploads') || path.startsWith('/images') ? path : `/uploads/${path}`;
};

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = $('#login-form');
    const registerForm = $('#register-form');
    const authContainer = $('#auth-container');
    const appContainer = $('#app-container');
    const userDisplayName = $('#user-display-name');
    const logoutBtn = $('#logout-btn');
    const profileBtn = $('#profile-btn');
    const profileModal = $('#profile-modal');
    const profileForm = $('#profile-form');
    const postImageInput = $('#post-image');
    const fileChosenSpan = $('#file-chosen');
    const timelineContainer = $('#timeline-container');
    const markAllReadBtn = $('#mark-all-read');
    const themeToggle = $('#theme-toggle');
    const settingsThemeToggle = $('#settings-theme-toggle');
    const settingsBtn = $('#settings-btn');
    const settingsModal = $('#settings-modal');
    const quickSearch = $('#quick-search');
    const composerAvatar = $('#composer-avatar');
    const profilePreviewAvatar = $('#profile-preview-avatar');
    const feedFilter = document.querySelector('.feed-filter');

    applyTheme(localStorage.getItem('theme') || 'light');
    wireNavigation();
    checkUserSession();

    $('#show-register').addEventListener('click', () => {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    });

    $('#show-login').addEventListener('click', () => {
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });

    document.querySelectorAll('[data-close]').forEach((button) => {
        button.addEventListener('click', () => $(`#${button.dataset.close}`).classList.add('hidden'));
    });

    [themeToggle, settingsThemeToggle].filter(Boolean).forEach((button) => {
        button.addEventListener('click', () => {
            applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
        });
    });

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const fullname = $('#reg-fullname').value.trim();
        const email = $('#reg-email').value.trim();
        const password = $('#reg-password').value;
        const avatarFile = $('#reg-avatar').files[0];

        if (password.length < 4) {
            alert('Le mot de passe doit contenir au moins 4 caracteres.');
            return;
        }

        const formData = new FormData();
        formData.append('fullname', fullname);
        formData.append('email', email);
        formData.append('password', password);
        if (avatarFile) formData.append('profile_picture', avatarFile);

        try {
            const response = await fetch('/api/auth/register', { method: 'POST', body: formData });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Inscription impossible.');
            alert(data.message);
            registerForm.reset();
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        } catch (error) {
            alert(error.message);
        }
    });

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: $('#login-email').value.trim(),
                    password: $('#login-password').value
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Identifiants incorrects.');
            connectSocket(data.user.id);
            showApp(data.user);
        } catch (error) {
            alert(error.message);
        }
    });

    logoutBtn.addEventListener('click', async () => {
        const response = await fetch('/api/auth/logout', { method: 'POST' });
        if (response.ok) {
            currentUser = null;
            authContainer.classList.remove('hidden');
            appContainer.classList.add('hidden');
        }
    });

    profileBtn.addEventListener('click', () => {
        if (!currentUser) return;
        $('#profile-fullname').value = currentUser.fullname || '';
        $('#profile-email').value = currentUser.email || '';
        $('#profile-current-password').value = '';
        $('#profile-new-password').value = '';
        $('#profile-confirm-password').value = '';
        $('#profile-avatar').value = '';
        if (profilePreviewAvatar) profilePreviewAvatar.src = avatarSrc(currentUser.profile_picture);
        profileModal.classList.remove('hidden');
    });

    profileForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const newPassword = $('#profile-new-password').value;
        const confirmPassword = $('#profile-confirm-password').value;
        if (newPassword && newPassword !== confirmPassword) {
            alert('Les mots de passe ne correspondent pas.');
            return;
        }

        const formData = new FormData();
        formData.append('fullname', $('#profile-fullname').value.trim());
        formData.append('email', $('#profile-email').value.trim());
        formData.append('currentPassword', $('#profile-current-password').value);
        formData.append('newPassword', newPassword);
        formData.append('confirmPassword', confirmPassword);
        if ($('#profile-avatar').files[0]) formData.append('profile_picture', $('#profile-avatar').files[0]);

        try {
            const response = await fetch('/api/auth/profile', { method: 'PUT', body: formData });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Mise a jour impossible.');
            currentUser = data.user;
            showApp(currentUser);
            profileModal.classList.add('hidden');
        } catch (error) {
            alert(error.message);
        }
    });

    postImageInput.addEventListener('change', () => {
        fileChosenSpan.textContent = postImageInput.files[0] ? postImageInput.files[0].name : 'Aucun fichier choisi';
    });

    $('#create-post-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const content = $('#post-content').value.trim();
        const imageFile = postImageInput.files[0];
        if (!content && !imageFile) {
            alert('Votre publication ne peut pas etre vide.');
            return;
        }

        const formData = new FormData();
        formData.append('content', content);
        if (imageFile) formData.append('image', imageFile);

        try {
            const response = await fetch('/api/posts/create', { method: 'POST', body: formData });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Publication impossible.');
            event.target.reset();
            fileChosenSpan.textContent = 'Aucun fichier choisi';
            await loadTimeline();
        } catch (error) {
            alert(error.message);
        }
    });

    markAllReadBtn.addEventListener('click', async () => {
        const response = await fetch('/api/notifications/read-all', { method: 'PUT' });
        if (response.ok) await loadNotifications();
    });

    if (quickSearch) {
        quickSearch.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' || !quickSearch.value.trim()) return;
            event.preventDefault();
            $('#searchInput').value = quickSearch.value.trim();
            $('#search-modal').classList.remove('hidden');
            $('#searchBtn').click();
        });
    }

    if (feedFilter) {
        feedFilter.addEventListener('click', (event) => {
            const button = event.target.closest('[data-feed-filter]');
            if (!button) return;
            activeFeedFilter = button.dataset.feedFilter;
            feedFilter.querySelectorAll('.chip').forEach((chip) => {
                chip.classList.toggle('active', chip === button);
            });
            renderTimelineFromCache();
        });
    }

    async function checkUserSession() {
        try {
            const response = await fetch('/api/auth/check');
            const data = await response.json();
            if (data.loggedIn) {
                connectSocket(data.user.id);
                showApp(data.user);
            }
        } catch (error) {
            authContainer.classList.remove('hidden');
        }
    }

    function connectSocket(userId) {
        window.socket = window.socket || io();
        window.socket.emit('register_user', Number(userId));
    }

    function showApp(user) {
        currentUser = user;
        userDisplayName.innerHTML = `<img src="${avatarSrc(user.profile_picture)}" class="author-img" alt=""> ${escapeHtml(user.fullname)}`;
        if (composerAvatar) composerAvatar.src = avatarSrc(user.profile_picture);
        if (profilePreviewAvatar) profilePreviewAvatar.src = avatarSrc(user.profile_picture);
        updateSidebarProfile(user);
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        loadTimeline();
        loadFriendsDashboard();
        initializeNotifications();
        if (window.checkAdminStatus) window.checkAdminStatus(user);
    }

    async function loadTimeline() {
        try {
            timelineContainer.innerHTML = '<div class="skeleton-card"></div><div class="skeleton-card"></div>';
            const response = await fetch('/api/posts/timeline');
            if (!response.ok) throw new Error('Impossible de charger le fil.');
            const posts = await response.json();
            timelinePostsCache = posts;
            updatePostCount(posts.filter((post) => Number(post.user_id) === Number(currentUser?.id)).length);
            renderTimelineFromCache();
        } catch (error) {
            timelineContainer.innerHTML = `<p class="empty-state error">${escapeHtml(error.message)}</p>`;
        }
    }

    async function renderTimelineFromCache() {
        timelineContainer.innerHTML = '';
        const posts = getFilteredPosts();

        if (!posts.length) {
            timelineContainer.innerHTML = `<p class="empty-state">${getEmptyFilterMessage()}</p>`;
            return;
        }

        for (const post of posts) {
            const commentsResponse = await fetch(`/api/posts/comments/${post.id}`);
            const comments = commentsResponse.ok ? await commentsResponse.json() : [];
            timelineContainer.appendChild(renderPost(post, comments));
        }
    }

    function getFilteredPosts() {
        const posts = [...timelinePostsCache];
        if (activeFeedFilter === 'friends') {
            return posts.filter((post) => friendIdsCache.has(Number(post.user_id)));
        }
        if (activeFeedFilter === 'popular') {
            return posts.sort((a, b) => interactionScore(b) - interactionScore(a));
        }
        if (activeFeedFilter === 'recent') {
            return posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        return posts;
    }

    function interactionScore(post) {
        return Number(post.likes_count || 0) + Number(post.comments_count || 0) + Number(post.shares_count || 0);
    }

    function getEmptyFilterMessage() {
        if (activeFeedFilter === 'friends') return "Aucune publication de vos amis pour le moment.";
        if (activeFeedFilter === 'popular') return "Aucune publication populaire pour le moment.";
        return "Aucune publication pour le moment.";
    }

    function renderPost(post, comments) {
        const card = document.createElement('article');
        card.className = 'post-card';
        const isAuthor = currentUser && Number(currentUser.id) === Number(post.user_id);
        const date = new Date(post.created_at).toLocaleString('fr-FR');

        card.innerHTML = `
            <header class="post-header">
                <div class="post-author-info">
                    <img src="${avatarSrc(post.profile_picture)}" class="author-img" alt="">
                    <div>
                        <strong>${escapeHtml(post.fullname)}</strong>
                        <span>${date}</span>
                    </div>
                </div>
                <div class="post-menu">
                    ${isAuthor ? `<button type="button" data-action="edit-post" data-id="${post.id}">Modifier</button><button type="button" data-action="delete-post" data-id="${post.id}">Supprimer</button>` : `<button type="button" data-action="friend-request" data-id="${post.user_id}">Ajouter</button>`}
                </div>
            </header>
            <div class="post-body">
                ${post.content ? `<p>${escapeHtml(post.content)}</p>` : ''}
                ${post.image ? `<img src="${post.image}" class="post-attached-img" alt="Image de publication">` : ''}
            </div>
            <div class="post-interactions">
                <button type="button" class="${post.has_liked ? 'active' : ''}" data-action="like" data-id="${post.id}">J'aime (${post.likes_count || 0})</button>
                <span>${post.comments_count || 0} commentaire(s)</span>
                <button type="button" data-action="share" data-id="${post.id}">Partager (${post.shares_count || 0})</button>
            </div>
            <div class="comments-list">
                ${comments.map((comment) => `
                    <div class="comment-item">
                        <span><strong>${escapeHtml(comment.fullname)}</strong> ${escapeHtml(comment.content)}</span>
                        ${Number(comment.user_id) === Number(currentUser.id) ? `<button type="button" data-action="delete-comment" data-id="${comment.id}">Supprimer</button>` : ''}
                    </div>
                `).join('')}
            </div>
            <form class="comment-form" data-id="${post.id}">
                <input type="text" placeholder="Ecrire un commentaire..." required>
                <button type="submit" class="btn btn-secondary">Envoyer</button>
            </form>
        `;

        card.addEventListener('click', handlePostAction);
        card.querySelector('.comment-form').addEventListener('submit', handleCommentSubmit);
        return card;
    }

    async function handlePostAction(event) {
        const button = event.target.closest('[data-action]');
        if (!button) return;
        const id = button.dataset.id;

        if (button.dataset.action === 'delete-post' && confirm('Supprimer cette publication ?')) {
            await fetch(`/api/posts/${id}`, { method: 'DELETE' });
            loadTimeline();
        }

        if (button.dataset.action === 'edit-post') {
            const currentText = button.closest('.post-card').querySelector('.post-body p')?.textContent || '';
            const content = prompt('Modifier la publication :', currentText);
            if (content && content.trim()) {
                await fetch(`/api/posts/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: content.trim() })
                });
                loadTimeline();
            }
        }

        if (button.dataset.action === 'like') {
            await fetch(`/api/posts/like/${id}`, { method: 'POST' });
            loadTimeline();
        }

        if (button.dataset.action === 'share') {
            const response = await fetch(`/api/posts/share/${id}`, { method: 'POST' });
            const data = await response.json();
            alert(data.message || data.error || 'Partage traite.');
            loadTimeline();
        }

        if (button.dataset.action === 'friend-request') {
            await sendFriendRequest(id);
        }

        if (button.dataset.action === 'delete-comment' && confirm('Supprimer ce commentaire ?')) {
            await fetch(`/api/posts/comment/${id}`, { method: 'DELETE' });
            loadTimeline();
        }
    }

    async function handleCommentSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const input = form.querySelector('input');
        await fetch(`/api/posts/comment/${form.dataset.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: input.value.trim() })
        });
        input.value = '';
        loadTimeline();
    }

    async function loadFriendsDashboard() {
        const container = $('#friends-sidebar-container');
        try {
            const response = await fetch('/api/friends/dashboard');
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Relations indisponibles.');
            friendIdsCache = new Set(data.friends.map((friend) => Number(friend.id)));
            updateFriendCount(data.friends.length);
            if (activeFeedFilter === 'friends' && timelinePostsCache.length) {
                renderTimelineFromCache();
            }

            container.innerHTML = `
                <h3>Demandes recues</h3>
                ${data.requests.length ? data.requests.map((request) => `
                    <div class="friend-row">
                        <img src="${avatarSrc(request.profile_picture)}" alt="">
                        <span>${escapeHtml(request.fullname)}</span>
                        <button type="button" data-friend-action="accept" data-id="${request.user_id}">OK</button>
                        <button type="button" data-friend-action="reject" data-id="${request.user_id}">Non</button>
                    </div>`).join('') : '<p class="muted">Aucune demande.</p>'}
                <h3>Mes amis</h3>
                ${data.friends.length ? data.friends.map((friend) => `
                    <div class="friend-row clickable" data-chat-id="${friend.id}" data-chat-name="${escapeHtml(friend.fullname)}">
                        <img src="${avatarSrc(friend.profile_picture)}" alt="">
                        <span>${escapeHtml(friend.fullname)}</span>
                        <button type="button" data-friend-action="remove" data-id="${friend.id}">Retirer</button>
                    </div>`).join('') : '<p class="muted">Aucun ami pour le moment.</p>'}
            `;
        } catch (error) {
            container.innerHTML = `<p class="muted error">${escapeHtml(error.message)}</p>`;
        }
    }

    $('#friends-sidebar-container').addEventListener('click', async (event) => {
        const friendButton = event.target.closest('[data-friend-action]');
        if (friendButton) {
            event.stopPropagation();
            const method = friendButton.dataset.friendAction === 'accept' ? 'PUT' : 'DELETE';
            const endpoint = friendButton.dataset.friendAction === 'accept' ? 'accept' : 'reject';
            await fetch(`/api/friends/${endpoint}/${friendButton.dataset.id}`, { method });
            loadFriendsDashboard();
            return;
        }

        const chatRow = event.target.closest('[data-chat-id]');
        if (chatRow && window.openChatWithFriend) {
            window.openChatWithFriend(chatRow.dataset.chatId, chatRow.dataset.chatName);
        }
    });

    async function sendFriendRequest(userId) {
        const response = await fetch(`/api/friends/request/${userId}`, { method: 'POST' });
        const data = await response.json();
        alert(data.message || data.error || 'Demande traitee.');
        loadFriendsDashboard();
    }

    async function initializeNotifications() {
        await loadNotifications();
        if (window.socket && !notificationSocketInitialized) {
            window.socket.on('new_notification', () => loadNotifications());
            notificationSocketInitialized = true;
        }
    }

    async function loadNotifications() {
        const list = $('#notification-list');
        const count = $('#notification-count');
        const response = await fetch('/api/notifications');
        if (!response.ok) return;
        const notifications = await response.json();
        count.textContent = notifications.filter((item) => !item.is_read).length;
        list.innerHTML = notifications.length ? notifications.map((item) => `
            <div class="notification-item ${item.is_read ? '' : 'unread'}" data-notification-id="${item.id}">
                <strong>${escapeHtml(item.sender_name)}</strong>
                <span>${escapeHtml(formatNotification(item))}</span>
                <small>${new Date(item.created_at).toLocaleString('fr-FR')}</small>
            </div>
        `).join('') : '<p class="muted">Aucune notification pour le moment.</p>';
    }

    $('#notification-list').addEventListener('click', async (event) => {
        const item = event.target.closest('[data-notification-id]');
        if (!item) return;
        await fetch(`/api/notifications/read/${item.dataset.notificationId}`, { method: 'PUT' });
        loadNotifications();
    });

    function formatNotification(notification) {
        const labels = {
            like: "a aime votre publication.",
            comment: 'a commente votre publication.',
            friend_request: "vous a envoye une demande d'ami.",
            message: 'vous a envoye un message.'
        };
        return labels[notification.type] || 'a genere une notification.';
    }

    function wireNavigation() {
        if (settingsBtn) settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));

        const profileIds = ['nav-profile-btn', 'mobile-profile-btn'];
        profileIds.forEach((id) => document.getElementById(id)?.addEventListener('click', () => profileBtn.click()));

        const settingsIds = ['nav-settings-btn'];
        settingsIds.forEach((id) => document.getElementById(id)?.addEventListener('click', () => settingsBtn.click()));

        document.getElementById('nav-messages-btn')?.addEventListener('click', () => {
            document.getElementById('chat-box').style.display = 'block';
        });

        document.getElementById('nav-notifications-btn')?.addEventListener('click', () => {
            document.getElementById('notification-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        document.getElementById('mobile-search-btn')?.addEventListener('click', () => document.getElementById('search-btn').click());
        document.getElementById('mobile-compose-btn')?.addEventListener('click', () => document.getElementById('post-content').focus());
    }

    function applyTheme(theme) {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('theme', theme);
        const isDark = theme === 'dark';
        if (themeToggle) {
            themeToggle.textContent = isDark ? 'Mode clair' : 'Mode sombre';
            themeToggle.setAttribute('aria-pressed', String(isDark));
        }
    }

    function updateSidebarProfile(user) {
        const sidebarProfile = document.getElementById('sidebar-profile');
        if (!sidebarProfile) return;
        sidebarProfile.innerHTML = `
            <img src="${avatarSrc(user.profile_picture)}" alt="" class="author-img elevated">
            <strong>${escapeHtml(user.fullname)}</strong>
            <span>${escapeHtml(user.email || 'Profil actif')}</span>
        `;
    }

    function updatePostCount(count) {
        const postStat = document.getElementById('stat-posts');
        if (postStat) postStat.textContent = count;
    }

    function updateFriendCount(count) {
        const friendStat = document.getElementById('stat-friends');
        if (friendStat) friendStat.textContent = count;
    }
});

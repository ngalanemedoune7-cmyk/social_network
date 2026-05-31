let currentUser = null;
let notificationSocketInitialized = false;

window.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/auth/check');
        const data = await res.json();
        if (data.loggedIn) window.location.href = '/index.html';
    } catch (e) {}

});

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const registerBox = document.getElementById('register-box');
    const userDisplayName = document.getElementById('user-display-name');
    const logoutBtn = document.getElementById('logout-btn');
    const notificationCount = document.getElementById('notification-count');
    const notificationList = document.getElementById('notification-list');
    const markAllReadBtn = document.getElementById('mark-all-read');

    document.getElementById('show-register').addEventListener('click', () => {
        loginForm.parentElement.classList.add('hidden');
        registerBox.classList.remove('hidden');
    });

    document.getElementById('show-login').addEventListener('click', () => {
        registerBox.classList.add('hidden');
        loginForm.parentElement.classList.remove('hidden');
    });

    checkUserSession();

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullname = document.getElementById('reg-fullname').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const avatarFile = document.getElementById('reg-avatar').files[0];

        if (password.length < 4) {
            alert('Le mot de passe doit contenir au moins 4 caractères.');
            return;
        }

        const formData = new FormData();
        formData.append('fullname', fullname);
        formData.append('email', email);
        formData.append('password', password);
        if (avatarFile) formData.append('profile_picture', avatarFile);

        try {
            const res = await fetch('/api/auth/register', { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Une erreur est survenue');
            alert(data.message);
            registerForm.reset();
            registerBox.classList.add('hidden');
            loginForm.parentElement.classList.remove('hidden');
        } catch (err) {
            alert(err.message);
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Identifiants incorrects');

            window.socket = window.socket || io();
            window.socket.emit('register_user', Number(data.user.id));
            showApp(data.user);
        } catch (err) {
            alert(err.message);
        }
    });

    logoutBtn.addEventListener('submit', (e) => e.preventDefault());
    logoutBtn.addEventListener('click', async () => {
        try {
            const res = await fetch('/api/auth/logout', { method: 'POST' });
            if (res.ok) hideApp();
        } catch (err) {
            console.error('Erreur lors de la déconnexion', err);
        }
    });

    async function checkUserSession() {
        try {
            const res = await fetch('/api/auth/check');
            const data = await res.json();
            if (data.loggedIn) {
                window.socket = window.socket || io();
                window.socket.emit('register_user', data.user.id);
                showApp(data.user);
            } else {
                hideApp();
            }
        } catch (err) {
            hideApp();
        }
    }

    function showApp(user) {
        currentUser = user;
        const avatarPath = user.profile_picture.startsWith('/uploads') ? user.profile_picture : `/uploads/${user.profile_picture}`;
        userDisplayName.innerHTML = `<img src="${avatarPath}" class="author-img" style="width:30px;height:30px;border-radius:50%;object-fit:cover;" onerror="this.src='https://via.placeholder.com/30'"> En ligne : ${user.fullname}`;
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        loadTimeline();
        loadFriendsDashboard();
        initializeNotifications();
        checkAdminStatus(user.id);
    }

    function hideApp() {
        authContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }

    const createPostForm = document.getElementById('create-post-form');
    const postImageInput = document.getElementById('post-image');
    const fileChosenSpan = document.getElementById('file-chosen');
    const timelineContainer = document.getElementById('timeline-container');

    if (postImageInput) {
        postImageInput.addEventListener('change', () => {
            fileChosenSpan.textContent = postImageInput.files.length > 0 ? postImageInput.files[0].name : 'Aucun fichier choisi';
        });
    }

    if (createPostForm) {
        createPostForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const content = document.getElementById('post-content').value.trim();
            const imageFile = postImageInput.files[0];

            if (!content && !imageFile) {
                alert("Votre publication ne peut pas être vide !");
                return;
            }

            const formData = new FormData();
            formData.append('content', content);
            if (imageFile) formData.append('image', imageFile);

            try {
                const res = await fetch('/api/posts/create', { method: 'POST', body: formData });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Erreur de publication');
                createPostForm.reset();
                fileChosenSpan.textContent = 'Aucun fichier choisi';
                loadTimeline();
            } catch (err) {
                alert(err.message);
            }
        });
    }

    async function loadTimeline() {

        try {
            const res = await fetch('/api/posts/timeline');
            if (!res.ok) throw new Error('Impossible de charger les publications');
            const posts = await res.json();

            timelineContainer.innerHTML = '';

            if (posts.length === 0) {
                timelineContainer.innerHTML = '<p class="loading-text">Aucune publication pour le moment. Soyez le premier !</p>';
                return;
            }

            for (const post of posts) {
                const postCard = document.createElement('div');
                postCard.className = 'post-card';

                const postDate = new Date(post.created_at).toLocaleString('fr-FR', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                });

                const isAuthor = currentUser && currentUser.id === post.user_id;
                const authorButtonsHtml = isAuthor
                    ? `<button class="btn-edit-post" data-id="${post.id}">Modifier</button><button class="btn-delete-post" data-id="${post.id}">Supprimer</button>`
                    : `<button class="btn-add-friend-timeline" data-user-id="${post.user_id}" style="background:#e4e6eb; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:12px; font-weight:bold;">➕ Ajouter en ami</button>`;

                const imageHtml = post.image ? `<img src="${post.image}" class="post-attached-img" alt="Image">` : '';

                const postAvatarPath = post.profile_picture
                    ? (post.profile_picture.startsWith('/uploads') ? post.profile_picture : `/uploads/${post.profile_picture}`)
                    : 'https://via.placeholder.com/40';

                const likeActiveStyle = post.has_liked ? 'style="color: #1877f2; font-weight: bold;"' : '';

                const commRes = await fetch(`/api/posts/comments/${post.id}`);
                const comments = await commRes.json();

                let commentsHtml = '';
                comments.forEach(c => {
                    const isCommentAuthor = currentUser && currentUser.id === c.user_id;
                    const deleteCommentBtn = isCommentAuthor
                        ? `<button class="btn-delete-comment" data-id="${c.id}" style="background:none; border:none; color:#ff4d4d; cursor:pointer; font-size:12px; margin-left:auto;">Supprimer</button>`
                        : '';

                    commentsHtml += `<div class="comment-item" style="display:flex; align-items:center; gap:10px; margin-bottom:8px; background:#f0f2f5; padding:8px; border-radius:6px; font-size:14px;">
                        <div>
                            <strong>${c.fullname} :</strong>
                            <span>${c.content}</span>
                        </div>
                        ${deleteCommentBtn}
                    </div>`;
                });

                postCard.innerHTML = `
                    <div class="post-header">
                        <div class="post-author-info">
                          <img src="${postAvatarPath}" class="author-img" onerror="this.src='https://via.placeholder.com/40'">
                            <div>
                                <div class="author-name">${post.fullname}</div>
                                <div class="post-date">${postDate}</div>
                            </div>
                        </div>
                        <div class="post-actions-top">${authorButtonsHtml}</div>
                    </div>
                    <div class="post-body">
                        <p>${post.content || ''}</p>
                        ${imageHtml}
                    </div>
                    <div class="post-interactions-bar" style="display:flex; justify-content:space-between; padding:10px 0; border-top:1px solid #e4e6eb; border-bottom:1px solid #e4e6eb; margin-top:10px;">
                        <button class="btn-like-post" data-id="${post.id}" ${likeActiveStyle}>👍 En cours (<span class="like-count">${post.likes_count}</span>)</button>
                        <span style="font-size:14px; color:#65676b;">💬 ${post.comments_count} commentaire(s)</span>
                        <button class="btn-share-post" data-id="${post.id}" style="background:none; border:none; color:#65676b; cursor:pointer; font-weight:650;">↪ Partager (<span class="share-count">${post.shares_count}</span>)</button>
                    </div>
                    <div class="comments-list-container" style="margin-top:10px; max-height:200px; overflow-y:auto;">${commentsHtml}</div>
                    <form class="comment-form" data-id="${post.id}" style="display:flex; gap:10px; margin-top:10px;">
                        <input type="text" placeholder="Écrire un commentaire..." style="flex-grow:1; padding:6px 10px; border:1px solid #ccd0d5; border-radius:20px; font-size:14px;" required>
                        <button type="submit" class="btn btn-small" style="padding:4px 12px; font-size:13px;">Envoyer</button>
                    </form>
                `;

                timelineContainer.appendChild(postCard);
            }

            document.querySelectorAll('.btn-delete-post').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const postId = e.target.getAttribute('data-id');
                    if (confirm('Voulez-vous vraiment supprimer cette publication ?')) {
                        try {
                            const deleteRes = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
                            if (deleteRes.ok) loadTimeline();
                        } catch (err) { console.error(err); }
                    }
                });
            });

            document.querySelectorAll('.btn-edit-post').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const postId = e.target.getAttribute('data-id');
                    const postCard = e.target.closest('.post-card');
                    const paragraph = postCard.querySelector('.post-body p');
                    const newContent = prompt('Modifiez votre publication :', paragraph.textContent);
                    if (newContent !== null && newContent.trim() !== '') {
                        try {
                            const updateRes = await fetch(`/api/posts/${postId}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ content: newContent })
                            });
                            if (updateRes.ok) loadTimeline();
                        } catch (err) { console.error(err); }
                    }
                });
            });

            document.querySelectorAll('.btn-like-post').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const targetBtn = e.target.closest('.btn-like-post');
                    const postId = targetBtn.getAttribute('data-id');
                    try {
                        const likeRes = await fetch(`/api/posts/like/${postId}`, { method: 'POST' });
                        if (likeRes.ok) loadTimeline();
                    } catch (err) { console.error(err); }
                });
            });

            document.querySelectorAll('.comment-form').forEach(form => {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const postId = form.getAttribute('data-id');
                    const input = form.querySelector('input');
                    const content = input.value.trim();

                    try {
                        const commRes = await fetch(`/api/posts/comment/${postId}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ content })
                        });
                        if (commRes.ok) {
                            input.value = '';
                            loadTimeline();
                        }
                    } catch (err) { console.error(err); }
                });
            });

            document.querySelectorAll('.btn-delete-comment').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const commentId = e.target.getAttribute('data-id');
                    if (confirm('Voulez-vous supprimer votre commentaire ?')) {
                        try {
                            const delCommRes = await fetch(`/api/posts/comment/${commentId}`, { method: 'DELETE' });
                            if (delCommRes.ok) loadTimeline();
                        } catch (err) { console.error(err); }
                    }
                });
            });

            document.querySelectorAll('.btn-share-post').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const postId = e.target.closest('.btn-share-post').getAttribute('data-id');
                    try {
                        const shareRes = await fetch(`/api/posts/share/${postId}`, { method: 'POST' });
                        const data = await shareRes.json();
                        alert(data.message);
                        loadTimeline();
                    } catch (err) { console.error(err); }
                });
            });

            document.querySelectorAll('.btn-add-friend-timeline').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const targetUserId = e.target.getAttribute('data-user-id');
                    sendFriendRequest(targetUserId);
                });
            });
        } catch (err) {
            timelineContainer.innerHTML = `<p class="loading-text" style="color:red;">${err.message}</p>`;
        }
    }

    async function loadFriendsDashboard() {
        try {
            const res = await fetch('/api/friends/dashboard');
            if (!res.ok) throw new Error('Erreur lors du chargement des amis');
            const data = await res.json();

            const sidebarContainer = document.getElementById('friends-sidebar-container');
            if (!sidebarContainer) return;

            let requestsHtml = '<h4 style="margin-top:0; color:#65676b; font-size:14px; text-transform:uppercase;">Demandes reçues</h4>';
            if (data.requests.length === 0) {
                requestsHtml += '<p style="color:#65676b; font-size:13px; font-style:italic;">Aucune demande en attente.</p>';
            } else {
                data.requests.forEach(req => {
                    requestsHtml += `<div style="display:flex; align-items:center; gap:10px; margin-bottom:12px; background:#f0f2f5; padding:8px; border-radius:6px;">
                        <img src="/uploads/${req.profile_picture}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;" onerror="this.src='https://via.placeholder.com/32'">
                        <span style="font-size:13px; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100px;">${req.fullname}</span>
                        <button class="btn-accept-friend" data-id="${req.user_id}" style="background:#1877f2; color:white; border:none; padding:4px 6px; border-radius:4px; cursor:pointer; font-size:11px; font-weight:bold; margin-left:auto;">Oui</button>
                        <button class="btn-reject-friend" data-id="${req.user_id}" style="background:#e4e6eb; color:#050505; border:none; padding:4px 6px; border-radius:4px; cursor:pointer; font-size:11px;">Non</button>
                    </div>`;
                });
            }

            let friendsListHtml = '<h4 style="margin-top:20px; color:#65676b; font-size:14px; text-transform:uppercase;">Mes Amis</h4>';
            if (data.friends.length === 0) {
                friendsListHtml += '<p style="color:#65676b; font-size:13px; font-style:italic;">Vous n\'avez pas encore d\'amis.</p>';
            } else {
                data.friends.forEach(friend => {
                    friendsListHtml += `<div class="friend-item" data-friend-id="${friend.id}" data-friend-name="${friend.fullname}" style="display:flex; align-items:center; gap:10px; margin-bottom:10px; padding:8px; border-radius:6px; cursor:pointer; transition:background 0.2s;">
                        <img src="/uploads/${friend.profile_picture}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;" onerror="this.src='https://via.placeholder.com/32'">
                        <span style="font-size:14px; font-weight:500;">${friend.fullname}</span>
                        <button class="btn-remove-friend" data-id="${friend.id}" style="background:none; border:none; color:#ff4d4d; cursor:pointer; font-size:12px; margin-left:auto;">✕</button>
                    </div>`;
                });
            }

            sidebarContainer.innerHTML = `
                <div style="background:white; padding:15px; border-radius:8px; box-shadow:0 1px 2px rgba(0,0,0,0.1);">
                    <h3 style="margin-top:0; border-bottom:1px solid #e4e6eb; padding-bottom:8px; font-size:16px; display:flex; align-items:center; gap:8px;">%👫 Relations</h3>
                    ${requestsHtml}
                    ${friendsListHtml}
                </div>
            `;

            document.querySelectorAll('.btn-accept-friend').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    const resp = await fetch(`/api/friends/accept/${id}`, { method: 'PUT' });
                    if (resp.ok) loadFriendsDashboard();
                });
            });

            document.querySelectorAll('.btn-reject-friend').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    const resp = await fetch(`/api/friends/reject/${id}`, { method: 'DELETE' });
                    if (resp.ok) loadFriendsDashboard();
                });
            });

            document.querySelectorAll('.btn-remove-friend').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const id = e.target.getAttribute('data-id');
                    if (confirm('Retirer cet ami ?')) {
                        const resp = await fetch(`/api/friends/reject/${id}`, { method: 'DELETE' });
                        if (resp.ok) loadFriendsDashboard();
                    }
                });
            });

            document.querySelectorAll('.friend-item').forEach(item => {
                item.addEventListener('click', () => {
                    const friendId = item.getAttribute('data-friend-id');
                    const friendName = item.getAttribute('data-friend-name');
                    if (window.openChatWithFriend) window.openChatWithFriend(friendId, friendName);
                });
            });
        } catch (err) {
            console.error(err);
        }
    }

    async function sendFriendRequest(userId) {
        try {
            const res = await fetch(`/api/friends/request/${userId}`, { method: 'POST' });
            const data = await res.json();
            alert(data.message || data.error);
            loadFriendsDashboard();
        } catch (err) {
            console.error(err);
        }
    }

    async function initializeNotifications() {
        await loadNotifications();

        if (window.socket && !notificationSocketInitialized) {
            window.socket.on('new_notification', (notification) => {
                addNotificationToList(notification, true);
                incrementNotificationCount(1);
            });
            notificationSocketInitialized = true;
        }

        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', async () => {
                try {
                    const res = await fetch('/api/notifications/read-all', { method: 'PUT' });
                    if (res.ok) await loadNotifications();
                } catch (err) {
                    console.error('Erreur lors du marquage des notifications lues', err);
                }
            });
        }

        if (notificationList) {
            notificationList.addEventListener('click', async (e) => {
                const item = e.target.closest('.notification-item');
                if (!item) return;
                const notificationId = item.getAttribute('data-notification-id');
                try {
                    const res = await fetch(`/api/notifications/read/${notificationId}`, { method: 'PUT' });
                    if (res.ok) {
                        item.classList.remove('unread');
                        await loadNotifications();
                    }
                } catch (err) {
                    console.error('Erreur lors de la lecture de la notification', err);
                }
            });
        }
    }

    async function loadNotifications() {
        const notificationListElement = document.getElementById('notification-list');
        const notificationCountElement = document.getElementById('notification-count');
        if (!notificationListElement || !notificationCountElement) return;

        try {
            const res = await fetch('/api/notifications');
            if (!res.ok) throw new Error('Impossible de charger les notifications');
            const notifications = await res.json();
            notificationListElement.innerHTML = '';
            let unreadCount = 0;

            if (notifications.length === 0) {
                notificationListElement.innerHTML = '<p style="color:#65676b; font-size:13px;">Aucune notification pour le moment.</p>';
            } else {
                notifications.forEach((notification) => {
                    addNotificationToList(notification, false);
                    if (!notification.is_read) unreadCount += 1;
                });
            }

            notificationCountElement.textContent = unreadCount;
        } catch (err) {
            console.error('Erreur lors du chargement des notifications :', err);
        }
    }

    function addNotificationToList(notification, prepend = false) {
        const notificationListElement = document.getElementById('notification-list');
        if (!notificationListElement) return;

        const item = document.createElement('div');
        item.className = `notification-item ${notification.is_read ? '' : 'unread'}`;
        item.setAttribute('data-notification-id', notification.id || '');
        item.innerHTML = `
            <div class="notification-content">
                <strong>${notification.sender_name || 'Quelqu\'un'}</strong>
                <span>${notification.message || formatNotificationText(notification)}</span>
            </div>
            <div class="notification-meta">${new Date(notification.created_at).toLocaleString('fr-FR')}</div>
        `;

        if (prepend) notificationListElement.prepend(item);
        else notificationListElement.appendChild(item);
    }

    function formatNotificationText(notification) {
        switch (notification.type) {
            case 'like':
                return 'a aimé votre publication.';
            case 'comment':
                return 'a commenté votre publication.';
            case 'friend_request':
                return 'vous a envoyé une demande d\'ami.';
            case 'message':
                return 'vous a envoyé un message.';
            default:
                return 'a généré une nouvelle notification.';
        }
    }

    function incrementNotificationCount(delta) {
        const notificationCountElement = document.getElementById('notification-count');
        if (!notificationCountElement) return;
        const current = Number(notificationCountElement.textContent) || 0;
        notificationCountElement.textContent = current + delta;
    }
});


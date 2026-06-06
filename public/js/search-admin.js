const htmlEscape = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
}[char]));

document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('search-btn');
    const adminBtn = document.getElementById('admin-btn');
    const resultsContainer = document.getElementById('search-results');

    searchBtn.addEventListener('click', () => {
        document.getElementById('search-modal').classList.remove('hidden');
        document.getElementById('searchInput').focus();
    });

    document.getElementById('searchBtn').addEventListener('click', performSearch);
    document.getElementById('searchInput').addEventListener('keydown', (event) => {
        if (event.key === 'Enter') performSearch();
    });

    resultsContainer.addEventListener('click', (event) => {
        const item = event.target.closest('[data-search-user-id]');
        if (!item || !window.openChatWithFriend) return;
        window.openChatWithFriend(item.dataset.searchUserId, item.dataset.searchUserName);
        document.getElementById('search-modal').classList.add('hidden');
    });

    adminBtn.addEventListener('click', () => {
        document.getElementById('admin-modal').classList.remove('hidden');
        switchAdminTab('statistics');
    });

    document.querySelectorAll('.tab-btn').forEach((button) => {
        button.addEventListener('click', () => switchAdminTab(button.dataset.tab));
    });
});

async function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    const resultsContainer = document.getElementById('search-results');
    if (!query) {
        resultsContainer.innerHTML = '<p class="muted">Entrez un terme de recherche.</p>';
        return;
    }

    resultsContainer.innerHTML = '<div class="skeleton-card"></div>';
    try {
        const [usersResponse, postsResponse] = await Promise.all([
            fetch(`/api/search/users?q=${encodeURIComponent(query)}`),
            fetch(`/api/search/posts?q=${encodeURIComponent(query)}`)
        ]);
        const users = await usersResponse.json();
        const posts = await postsResponse.json();

        const userResults = users.map((user) => `
            <button type="button" class="search-result-item" data-search-user-id="${user.id}" data-search-user-name="${htmlEscape(user.fullname)}">
                <img src="${user.profile_picture || '/images/default-avatar.svg'}" alt="" class="search-result-avatar">
                <span><strong>${htmlEscape(user.fullname)}</strong><small>${htmlEscape(user.email)}</small></span>
            </button>
        `).join('');

        const postResults = posts.map((post) => `
            <article class="search-result-item">
                <img src="${post.profile_picture || '/images/default-avatar.svg'}" alt="" class="search-result-avatar">
                <span><strong>${htmlEscape(post.fullname)}</strong><small>${htmlEscape((post.content || '').slice(0, 120))}</small></span>
            </article>
        `).join('');

        resultsContainer.innerHTML = `
            ${users.length ? `<h3>Utilisateurs</h3>${userResults}` : ''}
            ${posts.length ? `<h3>Publications</h3>${postResults}` : ''}
            ${!users.length && !posts.length ? '<p class="muted">Aucun resultat trouve.</p>' : ''}
        `;
    } catch (error) {
        resultsContainer.innerHTML = '<p class="muted error">Erreur lors de la recherche.</p>';
    }
}

function switchAdminTab(tabName) {
    document.querySelectorAll('.tab-content').forEach((tab) => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach((button) => button.classList.toggle('active', button.dataset.tab === tabName));
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');

    if (tabName === 'statistics') loadAdminStatistics();
    if (tabName === 'users') loadAdminUsers();
    if (tabName === 'posts') loadAdminPosts();
}

async function loadAdminStatistics() {
    const response = await fetch('/api/admin/statistics');
    if (!response.ok) return;
    const stats = await response.json();
    const labels = [
        ['totalUsers', 'Utilisateurs'],
        ['totalPosts', 'Publications'],
        ['totalComments', 'Commentaires'],
        ['totalLikes', 'Likes'],
        ['totalMessages', 'Messages'],
        ['totalNotifications', 'Notifications']
    ];
    document.getElementById('stats-grid').innerHTML = labels.map(([key, label]) => `
        <div class="stat-card">
            <strong>${stats[key] || 0}</strong>
            <span>${label}</span>
        </div>
    `).join('');
}

async function loadAdminUsers() {
    const response = await fetch('/api/admin/users');
    if (!response.ok) return;
    const users = await response.json();
    document.getElementById('users-table-body').innerHTML = users.map((user) => `
        <tr>
            <td>${htmlEscape(user.fullname)}</td>
            <td>${htmlEscape(user.email)}</td>
            <td>${htmlEscape(user.role || 'user')}</td>
            <td>${new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
            <td>
                ${user.role === 'admin' ? '<span class="pill">Admin</span>' : `<button type="button" onclick="setUserRole(${user.id}, 'admin')">Promouvoir</button>`}
                <button type="button" class="danger-link" onclick="deleteAdminUser(${user.id})">Supprimer</button>
            </td>
        </tr>
    `).join('');
}

async function loadAdminPosts() {
    const response = await fetch('/api/admin/posts');
    if (!response.ok) return;
    const posts = await response.json();
    document.getElementById('moderation-container').innerHTML = posts.length ? posts.map((post) => `
        <article class="moderation-item">
            <div>
                <strong>${htmlEscape(post.fullname)}</strong>
                <small>${new Date(post.created_at).toLocaleString('fr-FR')}</small>
                <p>${htmlEscape((post.content || '').slice(0, 220))}</p>
            </div>
            <button type="button" class="danger-link" onclick="deleteAdminPost(${post.id})">Supprimer</button>
        </article>
    `).join('') : '<p class="muted">Aucune publication.</p>';
}

async function deleteAdminUser(userId) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    const response = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Suppression impossible.');
    }
    loadAdminUsers();
}

async function setUserRole(userId, role) {
    if (!confirm('Promouvoir cet utilisateur ?')) return;
    const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
    });
    if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Promotion impossible.');
    }
    loadAdminUsers();
}

async function deleteAdminPost(postId) {
    if (!confirm('Supprimer cette publication ?')) return;
    await fetch(`/api/admin/posts/${postId}`, { method: 'DELETE' });
    loadAdminPosts();
}

window.checkAdminStatus = function (user) {
    const adminBtn = document.getElementById('admin-btn');
    adminBtn.style.display = user && user.role === 'admin' ? 'inline-flex' : 'none';
};

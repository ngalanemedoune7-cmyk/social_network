// RECHERCHE
document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            document.getElementById('search-modal').classList.remove('hidden');
        });
    }

    const searchInputElement = document.getElementById('searchInput');
    const searchBtnElement = document.getElementById('searchBtn');
    
    if (searchBtnElement) {
        searchBtnElement.addEventListener('click', performSearch);
    }
    
    if (searchInputElement) {
        searchInputElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }

    const adminBtn = document.getElementById('admin-btn');
    if (adminBtn) {
        adminBtn.addEventListener('click', () => {
            document.getElementById('admin-modal').classList.remove('hidden');
            loadAdminStatistics();
        });
    }
});

async function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) {
        alert('Veuillez entrer un terme de recherche');
        return;
    }

    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '<p>Recherche en cours...</p>';

    try {
        // Rechercher les utilisateurs
        const usersRes = await fetch(`/api/search/users?q=${encodeURIComponent(query)}`);
        const users = await usersRes.json();

        // Rechercher les publications
        const postsRes = await fetch(`/api/search/posts?q=${encodeURIComponent(query)}`);
        const posts = await postsRes.json();

        resultsContainer.innerHTML = '';

        if (users && users.length > 0) {
            const userTitle = document.createElement('h3');
            userTitle.textContent = '👥 Utilisateurs';
            userTitle.style.marginTop = '20px';
            userTitle.style.marginBottom = '10px';
            resultsContainer.appendChild(userTitle);

            users.forEach(user => {
                const userEl = document.createElement('div');
                userEl.className = 'search-result-item';
                userEl.innerHTML = `
                    <img src="${user.profile_picture || '/images/default-avatar.png'}" alt="${user.fullname}" class="search-result-avatar">
                    <div class="search-result-info">
                        <div class="search-result-name">${user.fullname}</div>
                        <div class="search-result-meta">${user.email}</div>
                    </div>
                `;
                userEl.addEventListener('click', () => {
                    // Ouvrir le chat avec cet utilisateur
                    if (window.openChatWithFriend) {
                        window.openChatWithFriend(user.id, user.fullname);
                    }
                    document.getElementById('search-modal').classList.add('hidden');
                });
                resultsContainer.appendChild(userEl);
            });
        }

        if (posts && posts.length > 0) {
            const postTitle = document.createElement('h3');
            postTitle.textContent = '📝 Publications';
            postTitle.style.marginTop = '20px';
            postTitle.style.marginBottom = '10px';
            resultsContainer.appendChild(postTitle);

            posts.forEach(post => {
                const postEl = document.createElement('div');
                postEl.className = 'search-result-item';
                postEl.innerHTML = `
                    <img src="${post.profile_picture || '/images/default-avatar.png'}" alt="${post.fullname}" class="search-result-avatar">
                    <div class="search-result-info">
                        <div class="search-result-name">${post.fullname}</div>
                        <div class="search-result-meta">${post.content.substring(0, 60)}...</div>
                    </div>
                `;
                postEl.addEventListener('click', () => {
                    // Scroller vers la publication
                    document.getElementById('search-modal').classList.add('hidden');
                });
                resultsContainer.appendChild(postEl);
            });
        }

        if ((!users || users.length === 0) && (!posts || posts.length === 0)) {
            resultsContainer.innerHTML = '<p>Aucun résultat trouvé.</p>';
        }
    } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        resultsContainer.innerHTML = '<p>Erreur lors de la recherche. Veuillez réessayer.</p>';
    }
}

// ADMINISTRATION
function switchAdminTab(tabName) {
    // Masquer tous les onglets
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Afficher l'onglet sélectionné
    const tabElement = document.getElementById(`${tabName}-tab`);
    if (tabElement) {
        tabElement.classList.remove('hidden');
    }

    // Marquer le bouton comme actif
    event.target.classList.add('active');

    // Charger les données appropriées
    if (tabName === 'users') {
        loadAdminUsers();
    }
}

async function loadAdminStatistics() {
    try {
        const response = await fetch('/api/admin/statistics');
        if (!response.ok) {
            console.error('Erreur lors de la récupération des statistiques');
            return;
        }
        
        const stats = await response.json();
        const statsGrid = document.getElementById('stats-grid');
        statsGrid.innerHTML = '';

        const statTypes = [
            { key: 'totalUsers', label: 'Utilisateurs', class: 'users' },
            { key: 'totalPosts', label: 'Publications', class: 'posts' },
            { key: 'totalComments', label: 'Commentaires', class: 'comments' },
            { key: 'totalLikes', label: 'Likes', class: 'likes' },
            { key: 'totalMessages', label: 'Messages', class: 'messages' },
            { key: 'totalNotifications', label: 'Notifications', class: 'notifications' }
        ];

        statTypes.forEach(stat => {
            const statCard = document.createElement('div');
            statCard.className = `stat-card ${stat.class}`;
            statCard.innerHTML = `
                <div class="stat-value">${stats[stat.key] || 0}</div>
                <div class="stat-label">${stat.label}</div>
            `;
            statsGrid.appendChild(statCard);
        });
    } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
    }
}

async function loadAdminUsers() {
    try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
            console.error('Erreur lors de la récupération des utilisateurs');
            return;
        }

        const users = await response.json();
        const tableBody = document.getElementById('users-table-body');
        tableBody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.fullname}</td>
                <td>${user.email}</td>
                <td>${new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
                <td>
                    <button class="btn-delete-user" onclick="deleteAdminUser(${user.id}, '${user.fullname}')">Supprimer</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
    }
}

async function deleteAdminUser(userId, userName) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userName}" ?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            alert('Erreur lors de la suppression de l\'utilisateur');
            return;
        }

        alert('Utilisateur supprimé avec succès');
        loadAdminUsers();
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
    }
}

// Afficher le bouton admin uniquement pour l'admin
function checkAdminStatus(userId) {
    const adminBtn = document.getElementById('admin-btn');
    if (adminBtn && userId === 1) {
        adminBtn.style.display = 'block';
    }
}

// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
});

function initializeSearch() {
    // Add loading states and error handling
    const userCards = document.querySelectorAll('.user-card');
    userCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Prevent default action if clicking on buttons
            if (e.target.closest('.action-btn')) {
                e.preventDefault();
            }
        });
    });
}

async function sendFriendRequest(userId) {
    const button = document.querySelector(`[data-user-id="${userId}"] .friend-btn`);
    if (!button) return;
    
    // Add loading state
    button.classList.add('loading');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner"></i><span>Sending...</span>';
    
    try {
        const response = await fetch('/friendRequest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': CSRF_TOKEN
            },
            body: JSON.stringify({
                action: 'send',
                user_id: userId
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            button.innerHTML = '<i class="fas fa-check"></i><span>Request Sent</span>';
            button.style.background = '#17bf63';
            button.disabled = true;
            showToast('Friend request sent successfully!', 'success');
        } else {
            throw new Error(result.error || 'Failed to send friend request');
        }
    } catch (error) {
        console.error('Error:', error);
        button.innerHTML = originalText;
        showToast(error.message || 'Failed to send friend request', 'error');
    } finally {
        button.classList.remove('loading');
    }
}

async function startChat(userId) {
    const button = document.querySelector(`[data-user-id="${userId}"] .message-btn`);
    if (!button) return;
    
    // Add loading state
    button.classList.add('loading');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner"></i><span>Starting...</span>';
    
    try {
        // Redirect to message page with user ID
        window.location.href = `/message?start_chat=1&user_id=${userId}`;
    } catch (error) {
        console.error('Error:', error);
        button.innerHTML = originalText;
        button.classList.remove('loading');
        showToast('Failed to start chat', 'error');
    }
}

function searchFor(query) {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.value = query;
        searchInput.closest('form').submit();
    } else {
        // Fallback: redirect with query parameter
        window.location.href = `/search?search=${encodeURIComponent(query)}`;
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('messageToast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.style.display = 'none';
        }, 300);
    }, 3000);
}

// Enhanced search with debouncing
let searchTimeout;
function debounceSearch(query, delay = 300) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        if (query.length >= 2) {
            performSearch(query);
        }
    }, delay);
}

async function performSearch(query) {
    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const results = await response.json();
        
        if (results.success) {
            updateSearchResults(results.users);
        }
    } catch (error) {
        console.error('Search error:', error);
    }
}

function updateSearchResults(users) {
    const resultsContainer = document.querySelector('.search-results');
    if (!resultsContainer) return;
    
    if (users.length === 0) {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3 class="empty-title">No results found</h3>
                <p class="empty-description">Try searching with different keywords.</p>
            </div>
        `;
        return;
    }
    
    resultsContainer.innerHTML = users.map(user => `
        <div class="user-card" data-user-id="${user.id}">
            <div class="user-avatar-container">
                <img src="${user.avatar || 'images/profile.jpg'}" 
                     alt="${user.firstName} ${user.lastName}" 
                     class="user-avatar"
                     onerror="this.src='images/profile.jpg'">
            </div>
            
            <div class="user-info">
                <h3 class="user-name">
                    ${user.firstName} ${user.lastName}
                    ${user.isCurrentUser ? '<span class="user-badge">You</span>' : ''}
                </h3>
                <p class="user-username">@${(user.firstName + user.lastName).toLowerCase().replace(/\s+/g, '')}</p>
            </div>
            
            <div class="user-actions">
                ${!user.isCurrentUser ? `
                    <button class="action-btn message-btn" onclick="startChat(${user.id})">
                        <i class="fas fa-envelope"></i>
                        <span>Message</span>
                    </button>
                    <button class="action-btn friend-btn" onclick="sendFriendRequest(${user.id})">
                        <i class="fas fa-user-plus"></i>
                        <span>Add Friend</span>
                    </button>
                ` : ''}
                <a href="profile?id=${user.id}" class="action-btn view-btn">
                    <i class="fas fa-eye"></i>
                    <span>View Profile</span>
                </a>
            </div>
        </div>
    `).join('');
}

// Auto-focus search input on page load
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput && !searchInput.value) {
        searchInput.focus();
    }
});
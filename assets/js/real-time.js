/**
 * Real-time Updates JavaScript
 * Handles real-time notifications, feed updates, and live interactions
 */

// Global variables
let realTimeInterval = null;
let lastUpdateTime = Date.now();
let isPageVisible = true;

// Add error suppression flags
let heartbeatFetchErrorLogged = false;
let likeCountsFetchErrorLogged = false;
let commentCountsFetchErrorLogged = false;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeRealTime();
});

/**
 * Initialize real-time functionality
 */
function initializeRealTime() {
    initializeVisibilityHandling();
    startRealTimeUpdates();
    initializeLiveInteractions();
    requestNotificationPermission();
}

/**
 * Request notification permission
 */
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

/**
 * Initialize page visibility handling
 */
function initializeVisibilityHandling() {
    document.addEventListener('visibilitychange', function() {
        isPageVisible = !document.hidden;
        
        if (isPageVisible) {
            // Page became visible - check for updates immediately
            checkForUpdates();
            startRealTimeUpdates();
        } else {
            // Page became hidden - reduce update frequency
            stopRealTimeUpdates();
        }
    });
}

/**
 * Start real-time updates
 */
function startRealTimeUpdates() {
    if (realTimeInterval) {
        clearInterval(realTimeInterval);
    }
    
    // Update every 15 seconds when page is visible
    realTimeInterval = setInterval(checkForUpdates, 15000);
}

/**
 * Stop real-time updates
 */
function stopRealTimeUpdates() {
    if (realTimeInterval) {
        clearInterval(realTimeInterval);
        realTimeInterval = null;
    }
}

/**
 * Check for all types of updates
 */
async function checkForUpdates() {
    if (!isPageVisible) return;
    
    try {
        await Promise.all([
            updateNotificationCounts(),
            checkForNewPosts(),
            updateLikeCounts(),
            updateCommentCounts()
        ]);
    } catch (error) {
        console.error('Real-time update error:', error);
    }
}

/**
 * Update notification and message counts
 */
async function updateNotificationCounts() {
    try {
        const response = await fetch('/api/notification-counts', {
            headers: {
                'X-CSRF-Token': window.csrfToken || ''
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Update notification badge
            updateBadge('notification-count', data.notifications);
            
            // Update message badge
            updateBadge('message-count', data.messages);
            
            // Show desktop notification for new notifications
            if (data.notifications > 0 && 'Notification' in window) {
                showDesktopNotification('New notifications', `You have ${data.notifications} new notification${data.notifications > 1 ? 's' : ''}`);
            }
        }
    } catch (error) {
        console.error('Failed to update notification counts:', error);
    }
}

/**
 * Update badge count
 */
function updateBadge(badgeId, count) {
    let badge = document.getElementById(badgeId);
    
    if (count > 0) {
        if (badge) {
            const oldCount = parseInt(badge.textContent);
            badge.textContent = count;
            badge.style.display = 'inline';
            
            // Add pulse animation for new notifications
            if (count > oldCount) {
                badge.classList.add('pulse');
                setTimeout(() => badge.classList.remove('pulse'), 1000);
            }
        } else {
            // Create badge if it doesn't exist
            const parentElement = badgeId === 'notification-count' 
                ? document.getElementById('notifications-link')
                : document.getElementById('messages-link');
                
            if (parentElement) {
                badge = document.createElement('span');
                badge.className = 'notification-badge pulse';
                badge.id = badgeId;
                badge.textContent = count;
                parentElement.appendChild(badge);
            }
        }
    } else if (badge) {
        badge.style.display = 'none';
    }
}

/**
 * Check for new posts in feed
 */
async function checkForNewPosts() {
    const feedContainer = document.getElementById('posts-feed');
    if (!feedContainer) return;
    
    try {
        const response = await fetch(`/api/new-posts-count?since=${lastUpdateTime}`, {
            headers: {
                'X-CSRF-Token': window.csrfToken || ''
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.newPosts && data.newPosts > 0) {
                showNewPostsIndicator(data.newPosts);
                lastUpdateTime = Date.now();
            }
        }
    } catch (error) {
        console.error('Failed to check for new posts:', error);
    }
}

/**
 * Show new posts indicator
 */
function showNewPostsIndicator(count) {
    // Remove existing indicator
    const existingIndicator = document.querySelector('.new-posts-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Create new indicator
    const indicator = document.createElement('div');
    indicator.className = 'new-posts-indicator';
    indicator.innerHTML = `
        <div class="indicator-content">
            <i class="fas fa-arrow-up"></i>
            <span>${count} new post${count > 1 ? 's' : ''}</span>
            <button onclick="refreshFeed()" class="refresh-btn">
                <i class="fas fa-sync"></i>
                Refresh
            </button>
            <button onclick="this.parentElement.parentElement.remove()" class="close-btn">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Insert at top of feed
    const feedContainer = document.getElementById('posts-feed');
    if (feedContainer) {
        feedContainer.insertBefore(indicator, feedContainer.firstChild);
        
        // Auto-hide after 30 seconds
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.style.animation = 'slideUp 0.3s ease forwards';
                setTimeout(() => {
                    if (indicator.parentNode) {
                        indicator.remove();
                    }
                }, 300);
            }
        }, 30000);
    }
}

/**
 * Update like counts for visible posts
 */
async function updateLikeCounts() {
    const postCards = document.querySelectorAll('.post-card[data-post-id]');
    if (postCards.length === 0) return;
    
    const visiblePosts = Array.from(postCards).filter(post => {
        const rect = post.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    });
    
    if (visiblePosts.length === 0) return;
    
    const postIds = visiblePosts.map(post => post.dataset.postId);
    
    try {
        const response = await fetch('/api/posts/like-counts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': window.csrfToken || ''
            },
            body: JSON.stringify({ post_ids: postIds })
        });
        likeCountsFetchErrorLogged = false; // Reset on success
        if (response.ok) {
            const data = await response.json();
            
            Object.entries(data.likeCounts).forEach(([postId, count]) => {
                const postCard = document.querySelector(`[data-post-id="${postId}"]`);
                if (postCard) {
                    const likeCountElement = postCard.querySelector('.like-count');
                    if (likeCountElement && likeCountElement.textContent != count) {
                        // Animate count change
                        likeCountElement.style.transform = 'scale(1.2)';
                        likeCountElement.textContent = count;
                        setTimeout(() => {
                            likeCountElement.style.transform = 'scale(1)';
                        }, 200);
                    }
                }
            });
        }
    } catch (error) {
        if (error instanceof TypeError && !likeCountsFetchErrorLogged) {
            console.error('Failed to update like counts: Network error or too many redirects.');
            likeCountsFetchErrorLogged = true;
        } else if (!(error instanceof TypeError)) {
            console.error('Failed to update like counts:', error);
        }
    }
}

/**
 * Update comment counts for visible posts
 */
async function updateCommentCounts() {
    const postCards = document.querySelectorAll('.post-card[data-post-id]');
    if (postCards.length === 0) return;
    
    const visiblePosts = Array.from(postCards).filter(post => {
        const rect = post.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    });
    
    if (visiblePosts.length === 0) return;
    
    const postIds = visiblePosts.map(post => post.dataset.postId);
    
    try {
        const response = await fetch('/api/posts/comment-counts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': window.csrfToken || ''
            },
            body: JSON.stringify({ post_ids: postIds })
        });
        commentCountsFetchErrorLogged = false; // Reset on success
        if (response.ok) {
            const data = await response.json();
            
            Object.entries(data.commentCounts).forEach(([postId, count]) => {
                const postCard = document.querySelector(`[data-post-id="${postId}"]`);
                if (postCard) {
                    const commentCountElement = postCard.querySelector('.comment-count');
                    if (commentCountElement && commentCountElement.textContent != count) {
                        // Animate count change
                        commentCountElement.style.transform = 'scale(1.2)';
                        commentCountElement.textContent = count;
                        setTimeout(() => {
                            commentCountElement.style.transform = 'scale(1)';
                        }, 200);
                    }
                }
            });
        }
    } catch (error) {
        if (error instanceof TypeError && !commentCountsFetchErrorLogged) {
            console.error('Failed to update comment counts: Network error or too many redirects.');
            commentCountsFetchErrorLogged = true;
        } else if (!(error instanceof TypeError)) {
            console.error('Failed to update comment counts:', error);
        }
    }
}

/**
 * Initialize live interactions
 */
function initializeLiveInteractions() {
    // Live typing indicators for comments
    initializeCommentTyping();
    
    // Live online status updates
    initializeOnlineStatus();
    
    // Live reaction animations
    initializeLiveReactions();
}

/**
 * Initialize comment typing indicators
 */
function initializeCommentTyping() {
    const commentInputs = document.querySelectorAll('.comment-input');
    
    commentInputs.forEach(input => {
        let typingTimeout = null;
        
        input.addEventListener('input', function() {
            const postId = this.closest('.post-card')?.dataset.postId;
            if (!postId) return;
            
            // Clear existing timeout
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
            
            // Send typing indicator
            sendCommentTypingIndicator(postId, true);
            
            // Stop typing after 2 seconds of inactivity
            typingTimeout = setTimeout(() => {
                sendCommentTypingIndicator(postId, false);
            }, 2000);
        });
    });
}

/**
 * Send comment typing indicator
 */
async function sendCommentTypingIndicator(postId, isTyping) {
    try {
        await fetch('/api/comment-typing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': window.csrfToken || ''
            },
            body: JSON.stringify({
                post_id: postId,
                typing: isTyping
            })
        });
    } catch (error) {
        console.error('Failed to send typing indicator:', error);
    }
}

/**
 * Initialize online status updates
 */
function initializeOnlineStatus() {
    // Send heartbeat every 30 seconds
    setInterval(sendHeartbeat, 30000);
    
    // Send heartbeat on page load
    sendHeartbeat();
    
    // Update online indicators
    setInterval(updateOnlineIndicators, 60000);
}

/**
 * Send heartbeat to server
 */
async function sendHeartbeat() {
    try {
        await fetch('/api/heartbeat', {
            method: 'POST',
            headers: {
                'X-CSRF-Token': window.csrfToken || ''
            }
        });
        heartbeatFetchErrorLogged = false; // Reset on success
    } catch (error) {
        if (error instanceof TypeError && !heartbeatFetchErrorLogged) {
            console.error('Failed to send heartbeat: Network error or too many redirects.');
            heartbeatFetchErrorLogged = true;
        } else if (!(error instanceof TypeError)) {
            console.error('Failed to send heartbeat:', error);
        }
    }
}

/**
 * Update online indicators
 */
async function updateOnlineIndicators() {
    try {
        const response = await fetch('/api/online-users', {
            headers: {
                'X-CSRF-Token': window.csrfToken || ''
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Update online indicators
            document.querySelectorAll('.online-indicator').forEach(indicator => {
                const userId = indicator.closest('[data-user-id]')?.dataset.userId;
                if (userId && data.onlineUsers.includes(parseInt(userId))) {
                    indicator.classList.add('active');
                } else {
                    indicator.classList.remove('active');
                }
            });
        }
    } catch (error) {
        console.error('Failed to update online indicators:', error);
    }
}

/**
 * Initialize live reactions
 */
function initializeLiveReactions() {
    // Listen for live reactions on posts
    document.addEventListener('click', function(e) {
        if (e.target.closest('.like-btn')) {
            const postCard = e.target.closest('.post-card');
            if (postCard) {
                showLiveReaction(postCard, 'like');
            }
        }
    });
}

/**
 * Show live reaction animation
 */
function showLiveReaction(postCard, reactionType) {
    const reaction = document.createElement('div');
    reaction.className = 'live-reaction';
    
    const icon = reactionType === 'like' ? '❤️' : '👍';
    reaction.textContent = icon;
    
    // Position randomly around the post
    const rect = postCard.getBoundingClientRect();
    const x = Math.random() * rect.width;
    const y = Math.random() * rect.height;
    
    reaction.style.position = 'absolute';
    reaction.style.left = x + 'px';
    reaction.style.top = y + 'px';
    reaction.style.fontSize = '1.5rem';
    reaction.style.pointerEvents = 'none';
    reaction.style.zIndex = '1000';
    reaction.style.animation = 'reactionFloat 2s ease-out forwards';
    
    postCard.style.position = 'relative';
    postCard.appendChild(reaction);
    
    // Remove after animation
    setTimeout(() => {
        if (reaction.parentNode) {
            reaction.remove();
        }
    }, 2000);
}

/**
 * Refresh the feed
 */
function refreshFeed() {
    window.location.reload();
}

/**
 * Show desktop notification
 */
function showDesktopNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: '/images/SB1.png',
            badge: '/images/SB1.png'
        });
    }
}

/**
 * Update notification times
 */
function updateNotificationTimes() {
    const timeElements = document.querySelectorAll('.notification-time');
    
    timeElements.forEach(element => {
        const datetime = element.getAttribute('datetime');
        if (datetime) {
            element.textContent = formatTimeAgo(datetime);
        }
    });
}

/**
 * Format time ago
 */
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}d ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    stopRealTimeUpdates();
});

// Add CSS for real-time features
const realTimeStyle = document.createElement('style');
realTimeStyle.textContent = `
    .notification-badge.pulse {
        animation: pulse 1s ease-in-out;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
    
    .new-posts-indicator {
        background: var(--primary-color);
        color: white;
        padding: 12px 20px;
        border-radius: var(--border-radius);
        margin-bottom: var(--spacing-md);
        animation: slideDown 0.3s ease;
        box-shadow: var(--shadow-medium);
    }
    
    .indicator-content {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        justify-content: center;
    }
    
    .refresh-btn, .close-btn {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s ease;
    }
    
    .refresh-btn:hover, .close-btn:hover {
        background: rgba(255, 255, 255, 0.3);
    }
    
    @keyframes slideDown {
        from {
            transform: translateY(-100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slideUp {
        to {
            transform: translateY(-100%);
            opacity: 0;
        }
    }
    
    .live-reaction {
        animation: reactionFloat 2s ease-out forwards;
    }
    
    @keyframes reactionFloat {
        0% {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translateY(-100px) scale(1.5);
            opacity: 0;
        }
    }
    
    .online-indicator {
        transition: all 0.3s ease;
    }
    
    .online-indicator.active {
        background: var(--online-color);
        box-shadow: 0 0 0 2px white, 0 0 0 4px var(--online-color);
    }
`;
document.head.appendChild(realTimeStyle);

// Update notification times every minute
setInterval(updateNotificationTimes, 60000);
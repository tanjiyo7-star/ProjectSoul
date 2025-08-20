/**
 * Notifications JavaScript
 * Handles notification interactions, real-time updates, and UI functionality
 */

// Global variables
let currentTab = 'all';
let notificationPollingInterval = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNotifications();
});

function initializeNotifications() {
    initializeRealTimeUpdates();
    initializeNotificationInteractions();
    updateTabCounts();
}

/**
 * Initialize tab switching functionality
 */
function initializeTabSwitching() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });
}

/**
 * Switch between notification tabs
 */
function switchTab(tabName) {
    currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Filter notifications based on tab
    filterNotificationsByTab(tabName);
}

/**
 * Filter notifications by tab
 */
function filterNotificationsByTab(tabName) {
    const notificationsList = document.getElementById('notificationsList');
    if (!notificationsList) return;
    
    const notifications = notificationsList.querySelectorAll('.notification-item');
    
    notifications.forEach(notification => {
        const type = notification.dataset.type;
        let shouldShow = false;
        
        switch (tabName) {
            case 'all':
                shouldShow = true;
                break;
            case 'friend-requests':
                shouldShow = type === 'friend-request';
                break;
            case 'system':
                shouldShow = type === 'system';
                break;
        }
        
        notification.style.display = shouldShow ? 'flex' : 'none';
    });
}

/**
 * Initialize real-time updates
 */
function initializeRealTimeUpdates() {
    // Poll for new notifications every 30 seconds
    notificationPollingInterval = setInterval(pollForNewNotifications, 30000);
    
    // Mark notifications as read when they come into view
    initializeIntersectionObserver();
}

/**
 * Poll for new notifications
 */
async function pollForNewNotifications() {
    try {
        const response = await fetch('/api/notifications/poll.php', {
            headers: {
                'X-CSRF-Token': window.csrfToken
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.newNotifications && data.newNotifications.length > 0) {
                addNewNotifications(data.newNotifications);
                updateTabCounts();
                showNewNotificationsBadge(data.newNotifications.length);
            }
        }
    } catch (error) {
        console.error('Failed to poll for new notifications:', error);
    }
}

/**
 * Add new notifications to the list
 */
function addNewNotifications(notifications) {
    const notificationsList = document.getElementById('notificationsList');
    if (!notificationsList) return;
    
    notifications.forEach(notification => {
        const notificationElement = createNotificationElement(notification);
        notificationsList.insertBefore(notificationElement, notificationsList.firstChild);
        
        // Animate in
        notificationElement.style.opacity = '0';
        notificationElement.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            notificationElement.style.transition = 'all 0.3s ease';
            notificationElement.style.opacity = '1';
            notificationElement.style.transform = 'translateY(0)';
        }, 100);
    });
}

/**
 * Create notification element
 */
function createNotificationElement(notification) {
    const div = document.createElement('div');
    div.className = `notification-item ${notification.status === 'unread' ? 'unread' : ''}`;
    div.dataset.id = notification.id;
    div.dataset.type = getNotificationType(notification.message);
    
    const timeAgo = formatTimeAgo(notification.created_at);
    const isFriendRequest = notification.message.includes('friend request');
    
    div.innerHTML = `
        <div class="notification-avatar">
            <img src="${notification.avatar || 'images/profile.jpg'}" 
                 alt="Profile"
                 onerror="this.src='images/profile.jpg'">
            ${notification.status === 'unread' ? '<div class="unread-indicator"></div>' : ''}
        </div>
        
        <div class="notification-content">
            <div class="notification-text">
                <strong>${escapeHtml(notification.firstName + ' ' + notification.lastName)}</strong>
                ${escapeHtml(notification.message)}
            </div>
            <div class="notification-meta">
                <time datetime="${notification.created_at}">${timeAgo}</time>
                ${notification.status === 'unread' ? '<span class="unread-badge">New</span>' : ''}
            </div>
        </div>
        
        <div class="notification-actions">
            ${isFriendRequest && notification.status === 'unread' ? `
                <button class="action-btn accept-btn" 
                        onclick="handleFriendRequest('accept', ${notification.fromUserId}, ${notification.id})"
                        title="Accept">
                    <i class="fas fa-check"></i>
                </button>
                <button class="action-btn decline-btn" 
                        onclick="handleFriendRequest('decline', ${notification.fromUserId}, ${notification.id})"
                        title="Decline">
                    <i class="fas fa-times"></i>
                </button>
            ` : `
                <button class="action-btn view-btn" 
                        onclick="viewNotification(${notification.id}, '${notification.post_id ? 'comments?post_id=' + notification.post_id : 'profile?id=' + notification.fromUserId}')"
                        title="View">
                    <i class="fas fa-eye"></i>
                </button>
            `}
            <button class="action-btn delete-btn" 
                    onclick="deleteNotification(${notification.id})"
                    title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return div;
}

/**
 * Initialize intersection observer for auto-marking as read
 */
function initializeIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const notification = entry.target;
                if (notification.classList.contains('unread')) {
                    // Mark as read after 2 seconds of being visible
                    setTimeout(() => {
                        if (notification.classList.contains('unread')) {
                            markNotificationAsRead(notification.dataset.id);
                        }
                    }, 2000);
                }
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe all unread notifications
    document.querySelectorAll('.notification-item.unread').forEach(notification => {
        observer.observe(notification);
    });
}

/**
 * Initialize notification interactions
 */
function initializeNotificationInteractions() {
    // Click to view notification
    document.addEventListener('click', function(e) {
        const notificationItem = e.target.closest('.notification-item');
        if (notificationItem && !e.target.closest('.notification-actions')) {
            const notificationId = notificationItem.dataset.id;
            const notification = window.notifications.find(n => n.id == notificationId);
            
            if (notification) {
                const url = notification.post_id 
                    ? `comments?post_id=${notification.post_id}`
                    : `profile?id=${notification.fromUserId}`;
                viewNotification(notificationId, url);
            }
        }
    });
}

/**
 * Handle friend request actions
 */
async function handleFriendRequest(action, userId, notificationId) {
    try {
        const response = await fetch('/friendRequest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': window.csrfToken
            },
            body: JSON.stringify({
                action: action,
                user_id: parseInt(userId)
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Remove notification from UI
            const notificationElement = document.querySelector(`[data-id="${notificationId}"]`);
            if (notificationElement) {
                notificationElement.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => {
                    notificationElement.remove();
                    updateTabCounts();
                }, 300);
            }
            
            showToast('success', data.message);
        } else {
            showToast('error', data.error || 'Action failed');
        }
    } catch (error) {
        console.error('Friend request error:', error);
        showToast('error', 'Network error occurred');
    }
}

/**
 * View notification
 */
function viewNotification(notificationId, url) {
    // Mark as read
    markNotificationAsRead(notificationId);
    
    // Navigate to URL
    window.location.href = url;
}

/**
 * Delete notification
 */
async function deleteNotification(notificationId) {
    if (!confirm('Are you sure you want to delete this notification?')) {
        return;
    }

    const notificationElement = document.querySelector(`[data-id="${notificationId}"]`);
    if (!notificationElement) return;

    // Add loading state
    notificationElement.style.opacity = '0.5';
    notificationElement.style.pointerEvents = 'none';

    // Ensure notificationId is a valid number
    const idNum = parseInt(notificationId);
    if (isNaN(idNum)) {
        notificationElement.style.opacity = '1';
        notificationElement.style.pointerEvents = 'auto';
        showToast('error', 'Invalid notification ID');
        return;
    }

    try {
        const response = await fetch('/api/notifications/delete.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': window.csrfToken
            },
            body: JSON.stringify({
                notification_id: idNum
            })
        });

        const data = await response.json();

        if (data.success) {
            // Remove notification from UI
            notificationElement.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                notificationElement.remove();
                updateTabCounts();

                // Check if list is empty
                checkEmptyState();
            }, 300);

            showToast('success', 'Notification deleted');
        } else {
            // Restore element state on error
            notificationElement.style.opacity = '1';
            notificationElement.style.pointerEvents = 'auto';
            showToast('error', data.error || 'Failed to delete notification');
        }
    } catch (error) {
        console.error('Delete notification error:', error);
        // Restore element state on error
        notificationElement.style.opacity = '1';
        notificationElement.style.pointerEvents = 'auto';
        showToast('error', 'Network error occurred');
    }
}

/**
 * Mark notification as read
 */
async function markNotificationAsRead(notificationId) {
    try {
        const response = await fetch('/api/notifications/mark-read', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': window.csrfToken
            },
            body: JSON.stringify({
                notification_id: parseInt(notificationId)
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update UI
            const notificationElement = document.querySelector(`[data-id="${notificationId}"]`);
            if (notificationElement) {
                notificationElement.classList.remove('unread');
                
                // Remove unread indicator
                const unreadIndicator = notificationElement.querySelector('.unread-indicator');
                if (unreadIndicator) {
                    unreadIndicator.remove();
                }
                
                // Remove unread badge
                const unreadBadge = notificationElement.querySelector('.unread-badge');
                if (unreadBadge) {
                    unreadBadge.remove();
                }
                
                updateTabCounts();
            }
        } else {
            console.error('Failed to mark as read:', data.error);
        }
    } catch (error) {
        console.error('Mark as read error:', error);
    }
}

/**
 * Mark all notifications as read
 */
async function markAllAsRead() {
    try {
        const response = await fetch('/api/notifications/mark-all-read', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': window.csrfToken
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update UI
            document.querySelectorAll('.notification-item.unread').forEach(notification => {
                notification.classList.remove('unread');
                
                const unreadIndicator = notification.querySelector('.unread-indicator');
                if (unreadIndicator) {
                    unreadIndicator.remove();
                }
                
                const unreadBadge = notification.querySelector('.unread-badge');
                if (unreadBadge) {
                    unreadBadge.remove();
                }
            });
            
            updateTabCounts();
            showToast('success', 'All notifications marked as read');
        } else {
            showToast('error', 'Failed to mark all as read');
        }
    } catch (error) {
        console.error('Mark all as read error:', error);
        showToast('error', 'Network error occurred');
    }
}

/**
 * Clear all notifications
 */
async function clearAllNotifications() {
    if (!confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch('/api/notifications/clear-all', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': window.csrfToken
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Clear UI
            const notificationsList = document.getElementById('notificationsList');
            if (notificationsList) {
                notificationsList.innerHTML = '';
            }
            
            updateTabCounts();
            checkEmptyState();
            showToast('success', 'All notifications cleared');
        } else {
            showToast('error', 'Failed to clear notifications');
        }
    } catch (error) {
        console.error('Clear all error:', error);
        showToast('error', 'Network error occurred');
    }
}

/**
 * Update tab counts
 */
function updateTabCounts() {
    const allNotifications = document.querySelectorAll('.notification-item');
    const friendRequestNotifications = document.querySelectorAll('.notification-item[data-type="friend-request"]');
    const systemNotifications = document.querySelectorAll('.notification-item[data-type="system"]');

    const allCountEl = document.getElementById('allCount');
    const friendRequestsCountEl = document.getElementById('friendRequestsCount');
    const systemCountEl = document.getElementById('systemCount');

    if (allCountEl) allCountEl.textContent = allNotifications.length;
    if (friendRequestsCountEl) friendRequestsCountEl.textContent = friendRequestNotifications.length;
    if (systemCountEl) systemCountEl.textContent = systemNotifications.length;

    // Hide counts if zero
    [
        { element: allCountEl, count: allNotifications.length },
        { element: friendRequestsCountEl, count: friendRequestNotifications.length },
        { element: systemCountEl, count: systemNotifications.length }
    ].forEach(({ element, count }) => {
        if (element) element.style.display = count > 0 ? 'inline' : 'none';
    });
}

/**
 * Check empty state
 */
function checkEmptyState() {
    const notificationsList = document.getElementById('notificationsList');
    const notifications = notificationsList.querySelectorAll('.notification-item');
    
    if (notifications.length === 0) {
        notificationsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-bell-slash"></i>
                </div>
                <h3>No notifications yet</h3>
                <p>When you get notifications, they'll show up here</p>
            </div>
        `;
    }
}

/**
 * Show new notifications badge
 */
function showNewNotificationsBadge(count) {
    // Create floating notification
    const badge = document.createElement('div');
    badge.className = 'new-notifications-badge';
    badge.innerHTML = `
        <i class="fas fa-bell"></i>
        <span>${count} new notification${count > 1 ? 's' : ''}</span>
        <button onclick="this.parentNode.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(badge);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (badge.parentNode) {
            badge.remove();
        }
    }, 5000);
}

/**
 * Get notification type from message
 */
function getNotificationType(message) {
    if (message.includes('friend request')) {
        return 'friend-request';
    } else if (message.includes('system')) {
        return 'system';
    } else {
        return 'general';
    }
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

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Show toast notification
 */
function showToast(type, message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 'info-circle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }, 4000);
}

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (notificationPollingInterval) {
        clearInterval(notificationPollingInterval);
    }
});

// Add CSS for new notifications badge
const style = document.createElement('style');
style.textContent = `
    .new-notifications-badge {
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: var(--shadow-medium);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    }
    
    .new-notifications-badge button {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
    }
    
    @keyframes slideOut {
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
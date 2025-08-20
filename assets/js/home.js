/**
 * Home Page JavaScript
 * Handles post interactions, real-time updates, and UI functionality
 */

// Global variables
let sharePostId = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeHomePage();
    initializeRealTimeUpdates();
});

/**
 * Initialize home page functionality
 */
function initializeHomePage() {
    initializePostInteractions();
    initializeMediaPreview();
    initializePrivacyToggle();
    initializeFriendRequests();
    initializeShareFunctionality();
    initializeImageModal();
}

/**
 * Initialize post interaction handlers
 */
function initializePostInteractions() {
    // Like button handlers
    document.addEventListener('click', function(e) {
        if (e.target.closest('.like-btn')) {
            e.preventDefault();
            const likeBtn = e.target.closest('.like-btn');
            const postId = likeBtn.dataset.postId;
            togglePostLike(postId);
        }
        
        // Share button handlers
        if (e.target.closest('.share-btn')) {
            e.preventDefault();
            const shareBtn = e.target.closest('.share-btn');
            const postId = shareBtn.dataset.postId;
            openShareModal(postId);
        }
    });
    
    // Comment form handlers
     document.body.addEventListener('submit', function(e) {
        if (e.target.classList.contains('comment-form')) {
            e.preventDefault();
            submitQuickComment(e);
        }
    });
}

/**
 * Toggle like status for a post
 */
async function togglePostLike(postId) {
    const likeBtn = document.querySelector(`[data-post-id="${postId}"].like-btn`);
    const heartIcon = likeBtn.querySelector('i');
    const likeCountSpan = likeBtn.querySelector('.like-count');
    
    const isLiked = likeBtn.classList.contains('liked');
    const action = isLiked ? 'unlike' : 'like';
    
    // Optimistic UI update
    updateLikeUI(likeBtn, heartIcon, likeCountSpan, !isLiked);
    
    try {
        const response = await fetch('/like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': window.csrfToken
            },
            body: JSON.stringify({
                post_id: parseInt(postId),
                action: action
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update with server response
            updateLikeUI(likeBtn, heartIcon, likeCountSpan, data.liked, data.like_count);
            showToast('success', isLiked ? 'Post unliked' : 'Post liked');
        } else {
            // Revert optimistic update on error
            updateLikeUI(likeBtn, heartIcon, likeCountSpan, isLiked);
            showToast('error', 'Failed to update like');
        }
    } catch (error) {
        console.error('Like error:', error);
        // Revert optimistic update on error
        updateLikeUI(likeBtn, heartIcon, likeCountSpan, isLiked);
        showToast('error', 'Network error occurred');
    }
}

/**
 * Update like button UI
 */
function updateLikeUI(likeBtn, heartIcon, likeCountSpan, isLiked, likeCount = null) {
    if (isLiked) {
        likeBtn.classList.add('liked');
        heartIcon.classList.remove('far');
        heartIcon.classList.add('fas');
    } else {
        likeBtn.classList.remove('liked');
        heartIcon.classList.remove('fas');
        heartIcon.classList.add('far');
    }
    
    if (likeCount !== null) {
        likeCountSpan.textContent = likeCount;
    } else {
        // Optimistic update
        const currentCount = parseInt(likeCountSpan.textContent);
        likeCountSpan.textContent = isLiked ? currentCount + 1 : currentCount - 1;
    }
}

/**
 * Submit quick comment
 */
async function submitQuickComment(event) {
    const form = event.target;
    const commentInput = form.querySelector('.comment-input');
    const submitBtn = form.querySelector('.comment-submit');
    const comment = commentInput.value.trim();
    const postId = form.dataset.postId;
    
    if (!comment) {
        showToast('error', 'Please enter a comment');
        return;
    }
    
    // Add loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    const formData = new FormData();
    formData.append('post_id', postId);
    formData.append('comment', comment);
    formData.append('csrf_token', window.csrfToken);
    
    try {
        const response = await fetch('/comment', {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            commentInput.value = '';
            updateCommentCount(postId);
            showToast('success', 'Comment added successfully');
        } else {
            showToast('error', 'Failed to add comment');
        }
    } catch (error) {
        console.error('Comment error:', error);
        showToast('error', 'Network error occurred');
    } finally {
        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
    }
}

/**
 * Update comment count for a post
 */
function updateCommentCount(postId) {
    const postCard = document.querySelector(`[data-post-id="${postId}"]`);
    const commentCountSpan = postCard.querySelector('.comment-count');
    const currentCount = parseInt(commentCountSpan.textContent);
    commentCountSpan.textContent = currentCount + 1;
}

/**
 * Initialize share functionality
 */
function initializeShareFunctionality() {
    // Create share modal if it doesn't exist
    if (!document.getElementById('shareModal')) {
        createShareModal();
    }
}

/**
 * Create share modal
 */
function createShareModal() {
    const modal = document.createElement('div');
    modal.id = 'shareModal';
    modal.className = 'share-modal';
    modal.style.display = 'none';
    modal.innerHTML = `
        <div class="share-modal-backdrop" onclick="closeShareModal()"></div>
        <div class="share-content">
            <div class="share-header">
                <h3>Share Post</h3>
                <button class="close-share-btn" onclick="closeShareModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="share-options">
                <button class="share-option" onclick="copyPostLink()">
                    <i class="fas fa-link"></i>
                    <span>Copy Link</span>
                </button>
                <button class="share-option" onclick="shareToFriends()">
                    <i class="fas fa-user-friends"></i>
                    <span>Share to Friends</span>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

/**
 * Open share modal
 */
function openShareModal(postId) {
    sharePostId = postId;
    const modal = document.getElementById('shareModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

/**
 * Close share modal
 */
function closeShareModal() {
    const modal = document.getElementById('shareModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    sharePostId = null;
}

/**
 * Copy post link to clipboard
 */
async function copyPostLink() {
    if (!sharePostId) return;
    
    const postUrl = `${window.location.origin}/comments?post_id=${sharePostId}`;
    
    try {
        await navigator.clipboard.writeText(postUrl);
        showToast('success', 'Post link copied to clipboard');
        closeShareModal();
    } catch (error) {
        console.error('Copy error:', error);
        showToast('error', 'Failed to copy link');
    }
}

/**
 * Share post to friends
 */
function shareToFriends() {
    if (!sharePostId) return;
    
    // For now, just copy the link - can be enhanced later
    copyPostLink();
}

/**
 * Initialize media preview functionality
 */
function initializeMediaPreview() {
    const fileInput = document.getElementById('imagefile');
    if (fileInput) {
        fileInput.addEventListener('change', previewMedia);
    }
}

/**
 * Preview selected media file
 */
function previewMedia(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('mediaPreview');
    const previewImg = document.getElementById('previewImg');
    const previewVideo = document.getElementById('previewVideo');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            if (file.type.startsWith('video/')) {
                previewVideo.src = e.target.result;
                previewVideo.style.display = 'block';
                previewImg.style.display = 'none';
            } else {
                previewImg.src = e.target.result;
                previewImg.style.display = 'block';
                previewVideo.style.display = 'none';
            }
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

/**
 * Remove media preview
 */
function removeMediaPreview() {
    const preview = document.getElementById('mediaPreview');
    const previewImg = document.getElementById('previewImg');
    const previewVideo = document.getElementById('previewVideo');
    const fileInput = document.getElementById('imagefile');
    
    previewImg.src = '';
    previewVideo.src = '';
    preview.style.display = 'none';
    fileInput.value = '';
}

/**
 * Initialize privacy toggle
 */
function initializePrivacyToggle() {
    const privacyCheckbox = document.getElementById('privacy-checkbox');
    const privacyIcon = document.querySelector('.privacy-icon');
    const privacyText = document.querySelector('.privacy-text');
    
    if (privacyCheckbox) {
        privacyCheckbox.addEventListener('change', function() {
            if (this.checked) {
                privacyIcon.className = 'fas fa-globe privacy-icon';
                privacyText.textContent = 'Public';
            } else {
                privacyIcon.className = 'fas fa-user-friends privacy-icon';
                privacyText.textContent = 'Friends';
            }
        });
    }
}

/**
 * Initialize friend request handlers
 */
function initializeFriendRequests() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('accept-btn')) {
            e.stopImmediatePropagation();
            const btn = e.target;
            if (btn.disabled) return; // Prevent double click
            btn.disabled = true;
            const userId = btn.closest('.friend-request').dataset.userId;
            handleFriendRequest('accept', userId).finally(() => {
                btn.disabled = false;
            });
        } else if (e.target.classList.contains('decline-btn')) {
            e.stopImmediatePropagation();
            const btn = e.target;
            if (btn.disabled) return; // Prevent double click
            btn.disabled = true;
            const userId = btn.closest('.friend-request').dataset.userId;
            handleFriendRequest('decline', userId).finally(() => {
                btn.disabled = false;
            });
        }
    });
}

/**
 * Handle friend request actions
 */
async function handleFriendRequest(action, userId) {
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
            // Remove the friend request from UI
            const requestElement = document.querySelector(`[data-user-id="${userId}"]`);
            if (requestElement) {
                requestElement.remove();
                updateFriendRequestCount(-1);
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
 * Update friend request count
 */
function updateFriendRequestCount(change) {
    const badge = document.querySelector('.sidebar-card .badge');
    if (badge) {
        const currentCount = parseInt(badge.textContent);
        const newCount = Math.max(0, currentCount + change);
        badge.textContent = newCount;
        
        if (newCount === 0) {
            badge.style.display = 'none';
        }
    }
}

/**
 * Initialize image modal
 */
function initializeImageModal() {
    const modal = document.getElementById('imageModal');
    
    if (modal) {
        // Close modal on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeImageModal();
            }
        });
        
        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeImageModal();
            }
        });
    }
}

/**
 * Open image modal
 */
function openImageModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    
    if (modal && modalImage) {
        modalImage.src = imageSrc;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Close image modal
 */
function closeImageModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

/**
 * Load more posts
 */
async function loadMorePosts() {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    const originalText = loadMoreBtn.innerHTML;
    
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    loadMoreBtn.disabled = true;
    
    try {
        // Simulate loading more posts
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        showToast('info', 'No more posts to load');
    } catch (error) {
        console.error('Load more error:', error);
        showToast('error', 'Failed to load more posts');
    } finally {
        loadMoreBtn.innerHTML = originalText;
        loadMoreBtn.disabled = false;
    }
}

/**
 * Initialize real-time updates
 */
function initializeRealTimeUpdates() {
    // Poll for new notifications every 30 seconds
    setInterval(updateNotificationCounts, 30000);
    
    // Poll for new posts every 60 seconds
    setInterval(checkForNewPosts, 60000);
    
    // Update like and comment counts every 45 seconds
    setInterval(updatePostCounts, 45000);
}

/**
 * Update notification counts
 */
async function updateNotificationCounts() {
    try {
        const response = await fetch('/api/notification-counts', {
            headers: {
                'X-CSRF-Token': window.csrfToken
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Update notification badge
            updateBadge('notification-count', data.notifications);
            
            // Update message badge
            updateBadge('message-count', data.messages);
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
            badge.textContent = count;
            badge.style.display = 'inline';
        } else {
            // Create badge if it doesn't exist
            const parentElement = badgeId === 'notification-count' 
                ? document.getElementById('notifications-link')
                : document.getElementById('messages-link');
                
            if (parentElement) {
                badge = document.createElement('span');
                badge.className = 'notification-badge';
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
 * Check for new posts
 */
async function checkForNewPosts() {
    try {
        const response = await fetch(`/api/new-posts-count?since=${Date.now() - 60000}`, {
            headers: {
                'X-CSRF-Token': window.csrfToken
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.newPosts > 0) {
                showNewPostsIndicator(data.newPosts);
            }
        }
    } catch (error) {
        console.error('Failed to check for new posts:', error);
    }
}

/**
 * Update post counts (likes and comments)
 */
async function updatePostCounts() {
    const postCards = document.querySelectorAll('.post-card[data-post-id]');
    if (postCards.length === 0) return;
    
    const postIds = Array.from(postCards).map(post => post.dataset.postId);
    
    try {
        // Update like counts
        const likeResponse = await fetch('/api/posts/like-counts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': window.csrfToken
            },
            body: JSON.stringify({ post_ids: postIds })
        });
        
        if (likeResponse.ok) {
            const likeData = await likeResponse.json();
            
            Object.entries(likeData.likeCounts).forEach(([postId, count]) => {
                const likeCountElement = document.querySelector(`[data-post-id="${postId}"] .like-count`);
                if (likeCountElement && likeCountElement.textContent != count) {
                    likeCountElement.textContent = count;
                }
            });
        }
        
        // Update comment counts
        const commentResponse = await fetch('/api/posts/comment-counts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': window.csrfToken
            },
            body: JSON.stringify({ post_ids: postIds })
        });
        
        if (commentResponse.ok) {
            const commentData = await commentResponse.json();
            
            Object.entries(commentData.commentCounts).forEach(([postId, count]) => {
                const commentCountElement = document.querySelector(`[data-post-id="${postId}"] .comment-count`);
                if (commentCountElement && commentCountElement.textContent != count) {
                    commentCountElement.textContent = count;
                }
            });
        }
    } catch (error) {
        console.error('Failed to update post counts:', error);
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
 * Refresh the feed
 */
function refreshFeed() {
    window.location.reload();
}

/**
 * Show toast notification
 */
function showToast(type, message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
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

// Add CSS for new features
const style = document.createElement('style');
style.textContent = `
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
    
    .share-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .share-modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
    }
    
    .share-content {
        background: white;
        border-radius: var(--border-radius-lg);
        width: 90%;
        max-width: 400px;
        position: relative;
        z-index: 1001;
        box-shadow: var(--shadow-medium);
        animation: modalSlideIn 0.3s ease;
    }
    
    .share-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-md);
        border-bottom: 1px solid var(--border-color);
    }
    
    .share-header h3 {
        font-size: 1.2rem;
        font-weight: 600;
        margin: 0;
    }
    
    .close-share-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }
    
    .close-share-btn:hover {
        background: var(--secondary-color);
        color: var(--text-primary);
    }
    
    .share-options {
        padding: var(--spacing-md);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }
    
    .share-option {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm) var(--spacing-md);
        border: none;
        background: var(--secondary-color);
        border-radius: var(--border-radius);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 1rem;
        font-weight: 500;
        color: var(--text-primary);
    }
    
    .share-option:hover {
        background: var(--primary-color);
        color: white;
        transform: translateY(-1px);
    }
    
    .share-option i {
        font-size: 1.1rem;
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
    
    @keyframes slideOut {
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
`;
document.head.appendChild(style);
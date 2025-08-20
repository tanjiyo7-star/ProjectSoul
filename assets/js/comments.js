/**
 * Comments JavaScript
 * Handles comment interactions, sorting, and real-time updates
 */

// Global variables
let currentSort = 'newest';
let commentPollingInterval = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    document.body.addEventListener('submit', async function(e) {
        if (e.target.classList.contains('comment-form')) {
            e.preventDefault();
            const form = e.target;
            const commentInput = form.querySelector('textarea[name="comment"]');
            const commentText = commentInput.value.trim();

            if (!commentText) {
                showToast('Please enter a comment.', 'error');
                return;
            }

            // Prepare data
            const postId = form.querySelector('input[name="post_id"]').value;
            const csrfToken = form.querySelector('input[name="csrf_token"]').value;

            // Send AJAX request
            try {
                const response = await fetch('/commentHandler', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `post_id=${encodeURIComponent(postId)}&comment=${encodeURIComponent(commentText)}&csrf_token=${encodeURIComponent(csrfToken)}`
                });
                const result = await response.json();

                if (result.success) {
                    showToast('Comment successfully added!', 'success');
                    commentInput.value = '';
                    // Option 1: Reload comments via AJAX (recommended)
                    reloadComments(postId);
                    // Option 2: Or reload page: location.reload();
                } else {
                    showToast(result.message || 'Failed to add comment.', 'error');
                }
            } catch (err) {
                showToast('Network error. Please try again.', 'error');
            }
        }
    });
});

/**
 * Initialize comments functionality
 */
function initializeComments() {
    initializeCommentForm();
    initializeSorting();
    initializeCommentActions();
    initializeRealTimeUpdates();
    autoResizeTextarea();
}

/**
 * Initialize comment form
 */
function initializeCommentForm() {
    const commentForm = document.querySelector('.comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', submitComment);
    }
    
    // Auto-resize textarea
    const commentInput = document.querySelector('.comment-input');
    if (commentInput) {
        commentInput.addEventListener('input', autoResizeTextarea);
        commentInput.addEventListener('keydown', handleKeyDown);
    }
}

/**
 * Auto-resize textarea
 */
function autoResizeTextarea() {
    const textarea = document.querySelector('.comment-input');
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyDown(event) {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        const form = event.target.closest('form');
        if (form) {
            submitComment({ target: form, preventDefault: () => {} });
        }
    }
}

/**
 * Submit comment
 */
async function submitComment(event) {
    event.preventDefault();
    
    const form = event.target;
    const commentInput = form.querySelector('.comment-input');
    const submitBtn = form.querySelector('.submit-btn');
    const comment = commentInput.value.trim();
    
    if (!comment) {
        showToast('error', 'Please enter a comment');
        commentInput.focus();
        return;
    }
    
    // Disable submit button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    // Create optimistic comment
    const optimisticComment = {
        id: 'temp_' + Date.now(),
        content: comment,
        userId: window.currentUserId,
        username: 'You',
        avatar: document.querySelector('.comment-input-container .profile-photo img').src,
        created_at: new Date().toISOString(),
        isOptimistic: true
    };
    
    // Add optimistic comment to UI
    addCommentToList(optimisticComment);
    commentInput.value = '';
    autoResizeTextarea();
    
    try {
        const formData = new FormData(form);
        
        const response = await fetch('/comment', {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Remove optimistic comment
            removeOptimisticComments();
            
            // Reload comments to get the real comment with proper ID
            await loadComments();
            
            showToast('success', 'Comment added successfully');
            updateCommentCount(1);
        } else {
            throw new Error(data.message || 'Failed to add comment');
        }
    } catch (error) {
        console.error('Comment submission error:', error);
        showToast('error', 'Failed to add comment');
        
        // Remove optimistic comment on error
        removeOptimisticComments();
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        commentInput.focus();
    }
}

/**
 * Add comment to list
 */
function addCommentToList(comment) {
    const commentsList = document.getElementById('commentsList');
    const emptyComments = commentsList.querySelector('.empty-comments');
    
    // Remove empty state if it exists
    if (emptyComments) {
        emptyComments.remove();
    }
    
    const commentElement = createCommentElement(comment);
    
    if (currentSort === 'newest') {
        commentsList.appendChild(commentElement);
    } else {
        commentsList.insertBefore(commentElement, commentsList.firstChild);
    }
    
    // Scroll to new comment
    commentElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Create comment element
 */
function createCommentElement(comment) {
    const div = document.createElement('div');
    div.className = 'comment-item';
    div.dataset.commentId = comment.id;
    
    if (comment.isOptimistic) {
        div.classList.add('optimistic');
    }
    
    const timeAgo = formatTimeAgo(comment.created_at);
    const isOwnComment = comment.userId == window.currentUserId;
    
    div.innerHTML = `
        <div class="comment-avatar">
            <a href="profile?id=${comment.userId}">
                <img src="${comment.avatar || 'images/profile.jpg'}" 
                     alt="Profile Picture"
                     onerror="this.src='images/profile.jpg'">
            </a>
        </div>
        <div class="comment-content">
            <div class="comment-bubble">
                <div class="comment-header">
                    <a href="profile?id=${comment.userId}" class="commenter-name">
                        ${escapeHtml(comment.username)}
                    </a>
                    <time class="comment-time" datetime="${comment.created_at}">
                        ${timeAgo}
                    </time>
                </div>
                <div class="comment-text">
                    <p>${escapeHtml(comment.content).replace(/\n/g, '<br>')}</p>
                </div>
            </div>
            <div class="comment-actions">
                <button class="comment-action-btn like-comment-btn" 
                        data-comment-id="${comment.id}">
                    <i class="far fa-heart"></i>
                    <span>Like</span>
                </button>
                <button class="comment-action-btn reply-btn" 
                        data-comment-id="${comment.id}">
                    <i class="fas fa-reply"></i>
                    <span>Reply</span>
                </button>
                ${isOwnComment ? `
                    <button class="comment-action-btn delete-btn" 
                            data-comment-id="${comment.id}"
                            onclick="deleteComment(${comment.id})">
                        <i class="fas fa-trash"></i>
                        <span>Delete</span>
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    return div;
}

/**
 * Remove optimistic comments
 */
function removeOptimisticComments() {
    const optimisticComments = document.querySelectorAll('.comment-item.optimistic');
    optimisticComments.forEach(comment => comment.remove());
}

/**
 * Initialize sorting functionality
 */
function initializeSorting() {
    const sortBtns = document.querySelectorAll('.sort-btn');
    sortBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const sortType = this.dataset.sort;
            switchSort(sortType);
        });
    });
}

/**
 * Switch comment sorting
 */
function switchSort(sortType) {
    if (sortType === currentSort) return;
    
    currentSort = sortType;
    
    // Update active button
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-sort="${sortType}"]`).classList.add('active');
    
    // Re-sort comments
    sortComments(sortType);
}

/**
 * Sort comments
 */
function sortComments(sortType) {
    const commentsList = document.getElementById('commentsList');
    const comments = Array.from(commentsList.querySelectorAll('.comment-item'));
    
    comments.sort((a, b) => {
        const timeA = new Date(a.querySelector('.comment-time').getAttribute('datetime'));
        const timeB = new Date(b.querySelector('.comment-time').getAttribute('datetime'));
        
        return sortType === 'newest' ? timeB - timeA : timeA - timeB;
    });
    
    // Re-append sorted comments
    comments.forEach(comment => {
        commentsList.appendChild(comment);
    });
}

/**
 * Initialize comment actions
 */
function initializeCommentActions() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.like-comment-btn')) {
            const btn = e.target.closest('.like-comment-btn');
            const commentId = btn.dataset.commentId;
            toggleCommentLike(commentId);
        } else if (e.target.closest('.reply-btn')) {
            const btn = e.target.closest('.reply-btn');
            const commentId = btn.dataset.commentId;
            replyToComment(commentId);
        }
    });
}

/**
 * Toggle comment like
 */
async function toggleCommentLike(commentId) {
    const likeBtn = document.querySelector(`[data-comment-id="${commentId}"].like-comment-btn`);
    const icon = likeBtn.querySelector('i');
    const isLiked = likeBtn.classList.contains('liked');
    
    // Optimistic UI update
    if (isLiked) {
        likeBtn.classList.remove('liked');
        icon.classList.remove('fas');
        icon.classList.add('far');
    } else {
        likeBtn.classList.add('liked');
        icon.classList.remove('far');
        icon.classList.add('fas');
    }
    
    try {
        const response = await fetch('/api/comment-like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': window.csrfToken
            },
            body: JSON.stringify({
                comment_id: parseInt(commentId),
                action: isLiked ? 'unlike' : 'like'
            })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            // Revert optimistic update on error
            if (isLiked) {
                likeBtn.classList.add('liked');
                icon.classList.remove('far');
                icon.classList.add('fas');
            } else {
                likeBtn.classList.remove('liked');
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
            showToast('error', 'Failed to update like');
        }
    } catch (error) {
        console.error('Comment like error:', error);
        // Revert optimistic update on error
        if (isLiked) {
            likeBtn.classList.add('liked');
            icon.classList.remove('far');
            icon.classList.add('fas');
        } else {
            likeBtn.classList.remove('liked');
            icon.classList.remove('fas');
            icon.classList.add('far');
        }
        showToast('error', 'Network error occurred');
    }
}

/**
 * Reply to comment
 */
function replyToComment(commentId) {
    const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);
    const commenterName = commentItem.querySelector('.commenter-name').textContent;
    const commentInput = document.querySelector('.comment-input');
    
    commentInput.value = `@${commenterName} `;
    commentInput.focus();
    commentInput.setSelectionRange(commentInput.value.length, commentInput.value.length);
    
    // Scroll to input
    commentInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Delete comment
 */
async function deleteComment(commentId) {
    // Prevent deleting optimistic comments (not yet saved on server)
    if (typeof commentId === 'string' && commentId.startsWith('temp_')) {
        showToast('error', 'Cannot delete comment before it is saved.');
        return;
    }

    if (!confirm('Are you sure you want to delete this comment?')) {
        return;
    }

    const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (!commentElement) {
        showToast('error', 'Comment not found.');
        return;
    }

    try {
        const response = await fetch('/api/comment-delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': window.csrfToken
            },
            body: JSON.stringify({
                comment_id: parseInt(commentId)
            })
        });

        // Enhanced error handling
        if (!response.ok) {
            console.error(`Delete comment failed: ${response.status} ${response.url}`);
            showToast('error', `Failed to connect to server (${response.status}). Please try again.`);
            return;
        }

        const data = await response.json();

        if (data.success) {
            // Remove comment from UI
            commentElement.style.animation = 'commentSlideOut 0.3s ease forwards';
            setTimeout(() => {
                commentElement.remove();
                updateCommentCount(-1);
                checkEmptyState();
            }, 300);
            
            showToast('success', 'Comment deleted');
        } else {
            showToast('error', data.message || 'Failed to delete comment');
        }
    } catch (error) {
        console.error('Delete comment error:', error);
        showToast('error', 'Network error occurred. Please check your connection or try again later.');
    }
}

/**
 * Initialize real-time updates
 */
function initializeRealTimeUpdates() {
    // Poll for new comments every 10 seconds
    commentPollingInterval = setInterval(pollForNewComments, 10000);
    
    // Stop polling when page is hidden
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            if (commentPollingInterval) {
                clearInterval(commentPollingInterval);
                commentPollingInterval = null;
            }
        } else {
            if (!commentPollingInterval) {
                commentPollingInterval = setInterval(pollForNewComments, 10000);
            }
        }
    });
}

/**
 * Poll for new comments
 */
async function pollForNewComments() {
    try {
        const response = await fetch(`/api/comments/${window.postId}/poll`, {
            headers: {
                'X-CSRF-Token': window.csrfToken
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.newComments && data.newComments.length > 0) {
                addNewComments(data.newComments);
            }
        }
    } catch (error) {
        console.error('Failed to poll for new comments:', error);
    }
}

/**
 * Add new comments to the list
 */
function addNewComments(comments) {
    comments.forEach(comment => {
        // Check if comment already exists
        const existingComment = document.querySelector(`[data-comment-id="${comment.id}"]`);
        if (!existingComment) {
            addCommentToList(comment);
            
            // Show notification for new comment
            if (comment.userId != window.currentUserId) {
                showNewCommentNotification(comment);
            }
        }
    });
    
    updateCommentCount(comments.length);
}

/**
 * Show new comment notification
 */
function showNewCommentNotification(comment) {
    showToast('info', `${comment.username} added a new comment`);
}

/**
 * Load comments from server
 */
async function loadComments() {
    try {
        const response = await fetch(`/api/comments/${window.postId}`, {
            headers: {
                'X-CSRF-Token': window.csrfToken
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayComments(data.comments);
        }
    } catch (error) {
        console.error('Failed to load comments:', error);
    }
}

/**
 * Display comments
 */
function displayComments(comments) {
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = '';
    
    if (comments.length === 0) {
        commentsList.innerHTML = `
            <div class="empty-comments">
                <div class="empty-icon">
                    <i class="fas fa-comment-slash"></i>
                </div>
                <h3>No comments yet</h3>
                <p>Be the first to comment on this post</p>
            </div>
        `;
        return;
    }
    
    comments.forEach(comment => {
        addCommentToList(comment);
    });
}

/**
 * Update comment count
 */
function updateCommentCount(change) {
    const commentCountElement = document.querySelector('.comment-count');
    if (commentCountElement) {
        const currentCount = parseInt(commentCountElement.textContent);
        const newCount = Math.max(0, currentCount + change);
        commentCountElement.textContent = newCount;
        
        // Update header count
        const headerCount = document.querySelector('.header-text p');
        if (headerCount) {
            headerCount.textContent = `${newCount} comment${newCount !== 1 ? 's' : ''}`;
        }
    }
}

/**
 * Check empty state
 */
function checkEmptyState() {
    const commentsList = document.getElementById('commentsList');
    const comments = commentsList.querySelectorAll('.comment-item');
    
    if (comments.length === 0) {
        commentsList.innerHTML = `
            <div class="empty-comments">
                <div class="empty-icon">
                    <i class="fas fa-comment-slash"></i>
                </div>
                <h3>No comments yet</h3>
                <p>Be the first to comment on this post</p>
            </div>
        `;
    }
}

/**
 * Toggle like for post
 */
async function toggleLike(postId) {
    const likeBtn = document.querySelector('.like-btn');
    const heartIcon = likeBtn.querySelector('i');
    const likeCountSpan = document.querySelector('.like-count');
    
    const isLiked = likeBtn.classList.contains('liked');
    const action = isLiked ? 'unlike' : 'like';
    
    // Optimistic UI update
    if (isLiked) {
        likeBtn.classList.remove('liked');
        heartIcon.classList.remove('fas');
        heartIcon.classList.add('far');
    } else {
        likeBtn.classList.add('liked');
        heartIcon.classList.remove('far');
        heartIcon.classList.add('fas');
    }
    
    // Update count optimistically
    const currentCount = parseInt(likeCountSpan.textContent);
    likeCountSpan.textContent = isLiked ? currentCount - 1 : currentCount + 1;
    
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
            likeCountSpan.textContent = data.like_count;
            showToast('success', isLiked ? 'Post unliked' : 'Post liked');
        } else {
            // Revert optimistic update on error
            if (isLiked) {
                likeBtn.classList.add('liked');
                heartIcon.classList.remove('far');
                heartIcon.classList.add('fas');
            } else {
                likeBtn.classList.remove('liked');
                heartIcon.classList.remove('fas');
                heartIcon.classList.add('far');
            }
            likeCountSpan.textContent = currentCount;
            showToast('error', 'Failed to update like');
        }
    } catch (error) {
        console.error('Like error:', error);
        // Revert optimistic update on error
        if (isLiked) {
            likeBtn.classList.add('liked');
            heartIcon.classList.remove('far');
            heartIcon.classList.add('fas');
        } else {
            likeBtn.classList.remove('liked');
            heartIcon.classList.remove('fas');
            heartIcon.classList.add('far');
        }
        likeCountSpan.textContent = currentCount;
        showToast('error', 'Network error occurred');
    }
}

/**
 * Open image modal
 */
function openImageModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    
    modalImage.src = imageSrc;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
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
function showToast(message, type) {
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
    if (commentPollingInterval) {
        clearInterval(commentPollingInterval);
    }
});

// Add CSS for comment animations
const style = document.createElement('style');
style.textContent = `
    .comment-item.optimistic {
        opacity: 0.7;
    }
    
    @keyframes commentSlideOut {
        to {
            opacity: 0;
            transform: translateX(-100%);
        }
    }
    
    @keyframes slideOut {
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

/**
 * Example reloadComments function
 */
async function reloadComments(postId) {
    try {
        const response = await fetch(`/comments?post_id=${postId}&ajax=1`);
        const html = await response.text();
        const commentsList = document.getElementById('commentsList');
        if (commentsList) commentsList.innerHTML = html;
    } catch (err) {
        showToast('Could not reload comments.', 'error');
    }
}
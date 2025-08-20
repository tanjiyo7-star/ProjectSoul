// Profile functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
});

function initializeProfile() {
    // Initialize friend request buttons
    initializeFriendRequests();
    
    // Initialize like functionality
    initializeLikes();
    
    // Initialize comment forms
    initializeComments();
    
    // Initialize post filters
    initializePostFilters();
    
    // Initialize image modal
    initializeImageModal();
}

function initializeFriendRequests() {
    // Add Friend
    const addFriendBtns = document.querySelectorAll('.add-friend-btn');
    addFriendBtns.forEach(btn => {
        btn.addEventListener('click', () => handleFriendRequest('send', btn.dataset.userId, btn));
    });
    
    // Accept Request
    const acceptBtns = document.querySelectorAll('.accept-request-btn');
    acceptBtns.forEach(btn => {
        btn.addEventListener('click', () => handleFriendRequest('accept', btn.dataset.userId, btn));
    });
    
    // Decline Request
    const declineBtns = document.querySelectorAll('.decline-request-btn');
    declineBtns.forEach(btn => {
        btn.addEventListener('click', () => handleFriendRequest('decline', btn.dataset.userId, btn));
    });
    
    // Cancel Request
    const cancelBtns = document.querySelectorAll('.cancel-request-btn');
    cancelBtns.forEach(btn => {
        btn.addEventListener('click', () => handleFriendRequest('cancel', btn.dataset.userId, btn));
    });
    
    // Unfriend
    const unfriendBtns = document.querySelectorAll('.unfriend-btn');
    unfriendBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Are you sure you want to unfriend this person?')) {
                handleFriendRequest('unfriend', btn.dataset.userId, btn);
            }
        });
    });
}

async function handleFriendRequest(action, userId, button) {
    if (!userId || !button) return;
    
    // Add loading state
    button.classList.add('loading');
    const originalContent = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner"></i> Processing...';
    button.disabled = true;
    
    try {
        const response = await fetch('/friendRequest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': CSRF_TOKEN
            },
            body: JSON.stringify({
                action: action,
                user_id: parseInt(userId)
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast(result.message, 'success');
            
            // Update button based on action
            updateButtonAfterAction(action, button);
            
            // Reload page after a short delay to reflect changes
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            throw new Error(result.error || 'Action failed');
        }
    } catch (error) {
        console.error('Error:', error);
        button.innerHTML = originalContent;
        button.disabled = false;
        showToast(error.message || 'An error occurred', 'error');
    } finally {
        button.classList.remove('loading');
    }
}

function updateButtonAfterAction(action, button) {
    switch(action) {
        case 'send':
            button.innerHTML = '<i class="fas fa-clock"></i> Request Sent';
            button.style.background = '#657786';
            break;
        case 'accept':
            button.innerHTML = '<i class="fas fa-check"></i> Friends';
            button.style.background = '#17bf63';
            break;
        case 'decline':
        case 'cancel':
            button.innerHTML = '<i class="fas fa-check"></i> Cancelled';
            button.style.background = '#657786';
            break;
        case 'unfriend':
            button.innerHTML = '<i class="fas fa-check"></i> Unfriended';
            button.style.background = '#657786';
            break;
    }
    button.disabled = true;
}

function initializeLikes() {
    const likeBtns = document.querySelectorAll('.like-btn');
    likeBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const postId = btn.dataset.postId;
            const heartIcon = btn.querySelector('i');
            const likeCountSpan = btn.querySelector('.like-count');
            
            if (!postId) return;
            
            const isLiked = heartIcon.classList.contains('fas');
            const action = isLiked ? 'unlike' : 'like';
            
            // Optimistic UI update
            if (isLiked) {
                heartIcon.classList.remove('fas', 'liked');
                heartIcon.classList.add('far');
                likeCountSpan.textContent = parseInt(likeCountSpan.textContent) - 1;
            } else {
                heartIcon.classList.remove('far');
                heartIcon.classList.add('fas', 'liked');
                likeCountSpan.textContent = parseInt(likeCountSpan.textContent) + 1;
            }
            
            try {
                const response = await fetch('/like', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        post_id: parseInt(postId),
                        action: action
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Update with actual count from server
                    likeCountSpan.textContent = result.like_count;
                    
                    // Ensure icon state matches server response
                    if (result.liked) {
                        heartIcon.classList.remove('far');
                        heartIcon.classList.add('fas', 'liked');
                    } else {
                        heartIcon.classList.remove('fas', 'liked');
                        heartIcon.classList.add('far');
                    }
                } else {
                    throw new Error(result.error || 'Like action failed');
                }
            } catch (error) {
                console.error('Error:', error);
                
                // Revert optimistic update on error
                if (action === 'like') {
                    heartIcon.classList.remove('fas', 'liked');
                    heartIcon.classList.add('far');
                    likeCountSpan.textContent = parseInt(likeCountSpan.textContent) - 1;
                } else {
                    heartIcon.classList.remove('far');
                    heartIcon.classList.add('fas', 'liked');
                    likeCountSpan.textContent = parseInt(likeCountSpan.textContent) + 1;
                }
                
                showToast('Failed to update like', 'error');
            }
        });
    });
}

function initializeComments() {
    const commentForms = document.querySelectorAll('.comment-form');
    commentForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const submitBtn = form.querySelector('.comment-submit-btn');
            const commentInput = form.querySelector('.comment-input');
            
            if (!commentInput.value.trim()) return;
            
            // Add loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            try {
                const response = await fetch('/comment', {
                    method: 'POST',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Clear form
                    commentInput.value = '';
                    
                    // Update comment count
                    const postId = formData.get('post_id');
                    const commentBtn = document.querySelector(`[data-post-id="${postId}"] .comment-btn`);
                    if (commentBtn) {
                        const countSpan = commentBtn.querySelector('.comment-count');
                        if (countSpan) {
                            countSpan.textContent = parseInt(countSpan.textContent) + 1;
                        }
                    }
                    
                    showToast('Comment added successfully!', 'success');
                } else {
                    throw new Error('Failed to add comment');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('Failed to add comment', 'error');
            } finally {
                // Reset button
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
            }
        });
    });
}

function initializePostFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const postCards = document.querySelectorAll('.post-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active filter
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            
            // Filter posts
            postCards.forEach(card => {
                const hasPhoto = card.querySelector('.post-image');
                const hasVideo = card.querySelector('.post-video');
                
                let show = true;
                
                if (filter === 'photos' && !hasPhoto) {
                    show = false;
                } else if (filter === 'videos' && !hasVideo) {
                    show = false;
                }
                
                card.style.display = show ? 'block' : 'none';
            });
        });
    });
}

function initializeImageModal() {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    
    if (!modal || !modalImage) return;
    
    // Close modal on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-backdrop')) {
            closeImageModal();
        }
    });
    
    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeImageModal();
        }
    });
}

function openImageModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    
    if (modal && modalImage) {
        modalImage.src = imageSrc;
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function openComments(postId) {
    // Redirect to comments page
    window.location.href = `/comments?post_id=${postId}`;
}

function startChat(userId) {
    window.location.href = `/message?start_chat=1&user_id=${userId}`;
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Smooth scroll to top when clicking stats
document.addEventListener('click', function(e) {
    if (e.target.closest('.stat-item')) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
});

// Lazy loading for images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}
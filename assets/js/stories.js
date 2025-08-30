/**
 * Story Viewer JavaScript
 * Beautiful Facebook-style story carousel and modal viewer
 * Supports both image and video stories with autoplay, next/prev navigation
 */

class StoryViewer {
    constructor() {
        this.userStories = [];
        this.currentUserIndex = 0;
        this.currentStoryIndex = 0;
        this.modal = null;
        this.progressBar = null;
        this.timer = null;
        this.storyDuration = 8000; // 8 seconds per story (image)
        this.isPlaying = true;
        this.videoPlaying = false;
        this.init();
    }

    init() {
        this.loadStoriesData();
        this.createModal();
        this.bindEvents();
    }

    loadStoriesData() {
        // Parse stories from DOM
        const storyElements = document.querySelectorAll('.story[data-user-id]');
        this.userStories = Array.from(storyElements).map(el => {
            let stories = [];
            try {
                stories = JSON.parse(el.dataset.stories.replace(/&quot;/g,'"'));
            } catch (e) {}
            return {
                userId: el.dataset.userId,
                username: el.dataset.storyUsername,
                avatar: el.dataset.storyAvatar,
                stories: stories.map(story => ({
                    media: story.media,
                    mediaType: story.mediaType,
                    // accept different name variants and fallback to now()
                    createdAt: story.created_at || story.createdAt || new Date().toISOString()
                }))
            };
        });
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'story-modal';
        this.modal.style.display = 'none';
        this.modal.innerHTML = `
            <div class="story-viewer">
                <div class="story-header">
                    <div class="story-progress-container">
                        <div class="story-progress-bar"></div>
                    </div>
                    <div class="story-user-info">
                        <img src="" alt="User" class="story-user-avatar" onclick="window.location.href='profile?id=' + ">
                        <div class="story-user-details">
                            <span class="story-username"></span>
                            <span class="story-time"></span>
                        </div>
                    </div>
                    <button class="story-close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="story-content">
                    <button class="story-nav-btn story-prev-btn">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <div class="story-media-container"></div>
                    <button class="story-nav-btn story-next-btn">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);
        this.progressBar = this.modal.querySelector('.story-progress-bar');
        // Bind modal events
        this.modal.querySelector('.story-close-btn').onclick = () => this.closeViewer();
        this.modal.querySelector('.story-prev-btn').onclick = () => this.prevStory();
        this.modal.querySelector('.story-next-btn').onclick = () => this.nextStory();
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeViewer();
        });
    }

    bindEvents() {
        // Open story on click
        document.addEventListener('click', (e) => {
            const storyEl = e.target.closest('.story[data-user-id]');
            if (storyEl && !storyEl.classList.contains('add-story')) {
                e.preventDefault();
                const userId = storyEl.dataset.userId;
                this.openUserStories(userId);
            }
        });
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.modal.style.display === 'flex') {
                if (e.key === 'Escape') this.closeViewer();
                if (e.key === 'ArrowLeft') this.prevStory();
                if (e.key === 'ArrowRight') this.nextStory();
                if (e.key === ' ') {
                    e.preventDefault();
                    this.togglePlayPause();
                }
            }
        });
    }

    openUserStories(userId) {
        this.currentUserIndex = this.userStories.findIndex(u => u.userId == userId);
        this.currentStoryIndex = 0;
        this.showStory();
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    showStory() {
        this.clearTimer();
        const user = this.userStories[this.currentUserIndex];
        const story = user.stories[this.currentStoryIndex];
        // Update user info
        const avatar = this.modal.querySelector('.story-user-avatar');
        avatar.src = user.avatar;
        avatar.onerror = () => { avatar.src = 'images/profile.jpg'; };
        this.modal.querySelector('.story-username').textContent = user.username;
        this.modal.querySelector('.story-time').textContent = this.formatTime(story.createdAt);
        // Media
        const mediaContainer = this.modal.querySelector('.story-media-container');
        mediaContainer.innerHTML = '';
        let mediaEl;
        if (story.mediaType === 'video') {
            mediaEl = document.createElement('video');
            mediaEl.src = story.media;
            mediaEl.className = 'story-media';
            mediaEl.autoplay = true;
            mediaEl.muted = true;
            mediaEl.playsInline = true;
            mediaEl.controls = false;
            mediaEl.onloadedmetadata = () => {
                this.storyDuration = Math.min(mediaEl.duration * 1000, 15000); // max 15s
                this.startProgress();
                mediaEl.play();
            };
            mediaEl.onended = () => this.nextStory();
            mediaEl.onerror = () => this.showError('Failed to load video');
            mediaContainer.appendChild(mediaEl);
            this.videoPlaying = true;
        } else {
            mediaEl = document.createElement('img');
            mediaEl.src = story.media;
            mediaEl.className = 'story-media';
            mediaEl.alt = 'Story';
            mediaEl.onload = () => {
                this.storyDuration = 8000;
                this.startProgress();
            };
            mediaEl.onerror = () => this.showError('Failed to load image');
            mediaContainer.appendChild(mediaEl);
            this.videoPlaying = false;
        }
        // Navigation buttons
        this.modal.querySelector('.story-prev-btn').style.display =
            (this.currentUserIndex > 0 || this.currentStoryIndex > 0) ? 'flex' : 'none';
        this.modal.querySelector('.story-next-btn').style.display =
            (this.currentUserIndex < this.userStories.length - 1 ||
             this.currentStoryIndex < user.stories.length - 1) ? 'flex' : 'none';
    }

    startProgress() {
        this.clearTimer();
        this.progressBar.style.width = '0%';
        this.isPlaying = true;
        let start = Date.now();
        let duration = this.storyDuration;
        const step = () => {
            if (!this.isPlaying) return;
            let elapsed = Date.now() - start;
            let percent = Math.min(100, (elapsed / duration) * 100);
            this.progressBar.style.width = percent + '%';
            if (percent < 100) {
                this.timer = requestAnimationFrame(step);
            } else {
                this.nextStory();
            }
        };
        this.timer = requestAnimationFrame(step);
    }

    clearTimer() {
        if (this.timer) {
            cancelAnimationFrame(this.timer);
            this.timer = null;
        }
    }

    nextStory() {
        const user = this.userStories[this.currentUserIndex];
        if (this.currentStoryIndex < user.stories.length - 1) {
            this.currentStoryIndex++;
            this.showStory();
        } else if (this.currentUserIndex < this.userStories.length - 1) {
            this.currentUserIndex++;
            this.currentStoryIndex = 0;
            this.showStory();
        } else {
            this.closeViewer();
        }
    }

    prevStory() {
        if (this.currentStoryIndex > 0) {
            this.currentStoryIndex--;
            this.showStory();
        } else if (this.currentUserIndex > 0) {
            this.currentUserIndex--;
            this.currentStoryIndex = this.userStories[this.currentUserIndex].stories.length - 1;
            this.showStory();
        }
    }

    closeViewer() {
        this.clearTimer();
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        if (this.isPlaying) {
            this.startProgress();
            // Resume video if paused
            const mediaEl = this.modal.querySelector('.story-media');
            if (mediaEl && mediaEl.tagName === 'VIDEO') mediaEl.play();
        } else {
            this.clearTimer();
            // Pause video if playing
            const mediaEl = this.modal.querySelector('.story-media');
            if (mediaEl && mediaEl.tagName === 'VIDEO') mediaEl.pause();
        }
    }

    formatTime(dateString) {
        if (!dateString) return '';
        const d = new Date(dateString);
        if (Number.isNaN(d.getTime())) return '';
        const now = new Date();
        const diff = Math.floor((now - d) / 1000);
        if (diff < 60) return '';
        if (diff < 3600) return Math.floor(diff/60) + 'm ago';
        if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }

    showError(msg) {
        const mediaContainer = this.modal.querySelector('.story-media-container');
        mediaContainer.innerHTML = `<div class="story-error"><i class="fas fa-exclamation-circle"></i><p>${msg}</p></div>`;
        this.progressBar.style.width = '100%';
    }
}

// Initialize story viewer
document.addEventListener('DOMContentLoaded', () => {
    new StoryViewer();
});
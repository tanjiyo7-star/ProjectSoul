/**
 * Story Viewer JavaScript
 * Handles Facebook-style story carousel and modal viewer
 */

class StoryViewer {
    constructor() {
        this.currentStoryIndex = 0;
        this.stories = [];
        this.modal = null;
        this.progressBar = null;
        this.timer = null;
        this.storyDuration = 5000; // 5 seconds per story
        this.isPlaying = false;
        
        this.init();
    }
    
    init() {
        this.loadStoriesData();
        this.createModal();
        this.bindEvents();
        this.initializeCarousel();
    }
    
    loadStoriesData() {
        // Get stories from window.stories or DOM elements
        if (window.stories && window.stories.length > 0) {
            this.stories = window.stories.map(story => ({
                id: story.id,
                userId: story.userId,
                media: story.media,
                mediaType: story.mediaType,
                author: `${story.firstName} ${story.lastName}`,
                avatar: story.avatar || 'images/profile.jpg',
                createdAt: story.created_at
            }));
        } else {
            // Fallback to DOM elements
            const storyElements = document.querySelectorAll('.story[data-story-id]');
            this.stories = Array.from(storyElements).map(element => ({
                id: element.dataset.storyId,
                userId: element.dataset.userId || '',
                media: element.dataset.media || '',
                mediaType: element.dataset.mediaType || 'image',
                author: element.dataset.author || 'Unknown',
                avatar: element.dataset.avatar || 'images/profile.jpg',
                createdAt: element.dataset.createdAt || new Date().toISOString()
            }));
        }
    }
    
    initializeCarousel() {
        const storiesContainer = document.querySelector('.stories-container');
        if (!storiesContainer) return;
        
        // Add scroll buttons for better navigation
        this.addScrollButtons(storiesContainer);
        
        // Enable smooth scrolling
        storiesContainer.style.scrollBehavior = 'smooth';
        
        // Add touch/swipe support for mobile
        this.addTouchSupport(storiesContainer);
    }
    
    addScrollButtons(container) {
        const storiesSection = container.closest('.stories-section');
        if (!storiesSection) return;
        
        // Create scroll buttons
        const scrollLeft = document.createElement('button');
        scrollLeft.className = 'story-scroll-btn story-scroll-left';
        scrollLeft.innerHTML = '<i class="fas fa-chevron-left"></i>';
        scrollLeft.onclick = () => this.scrollStories('left');
        
        const scrollRight = document.createElement('button');
        scrollRight.className = 'story-scroll-btn story-scroll-right';
        scrollRight.innerHTML = '<i class="fas fa-chevron-right"></i>';
        scrollRight.onclick = () => this.scrollStories('right');
        
        // Add buttons to stories section
        storiesSection.style.position = 'relative';
        storiesSection.appendChild(scrollLeft);
        storiesSection.appendChild(scrollRight);
        
        // Update button visibility based on scroll position
        container.addEventListener('scroll', () => {
            this.updateScrollButtons(container, scrollLeft, scrollRight);
        });
        
        // Initial button state
        this.updateScrollButtons(container, scrollLeft, scrollRight);
    }
    
    updateScrollButtons(container, leftBtn, rightBtn) {
        const { scrollLeft, scrollWidth, clientWidth } = container;
        
        leftBtn.style.display = scrollLeft > 0 ? 'flex' : 'none';
        rightBtn.style.display = scrollLeft < scrollWidth - clientWidth - 10 ? 'flex' : 'none';
    }
    
    scrollStories(direction) {
        const container = document.querySelector('.stories-container');
        const scrollAmount = 240; // Width of 2 stories
        
        if (direction === 'left') {
            container.scrollLeft -= scrollAmount;
        } else {
            container.scrollLeft += scrollAmount;
        }
    }
    
    addTouchSupport(container) {
        let startX = 0;
        let scrollStart = 0;
        
        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            scrollStart = container.scrollLeft;
        });
        
        container.addEventListener('touchmove', (e) => {
            if (!startX) return;
            
            const currentX = e.touches[0].clientX;
            const diff = startX - currentX;
            container.scrollLeft = scrollStart + diff;
        });
        
        container.addEventListener('touchend', () => {
            startX = 0;
            scrollStart = 0;
        });
    }
    
    bindEvents() {
        // Story click events
        document.addEventListener('click', (e) => {
            const storyElement = e.target.closest('.story[data-story-id]');
            if (storyElement && !storyElement.classList.contains('add-story')) {
                e.preventDefault();
                const storyId = storyElement.dataset.storyId;
                this.openStory(storyId);
            }

            // Scroll button events (delegated, since buttons are dynamically created)
            if (e.target.closest('.story-scroll-left')) {
                e.preventDefault();
                this.scrollStories('left');
            }
            if (e.target.closest('.story-scroll-right')) {
                e.preventDefault();
                this.scrollStories('right');
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.modal && this.modal.style.display === 'flex') {
                switch(e.key) {
                    case 'Escape':
                        this.closeStory();
                        break;
                    case 'ArrowLeft':
                        this.previousStory();
                        break;
                    case 'ArrowRight':
                        this.nextStory();
                        break;
                    case ' ':
                        e.preventDefault();
                        this.togglePlayPause();
                        break;
                }
            }
        });
    }
    
    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'story-modal';
        this.modal.innerHTML = `
            <div class="story-viewer">
                <div class="story-header">
                    <div class="story-progress-container">
                        <div class="story-progress-bar"></div>
                    </div>
                    <div class="story-user-info">
                        <img src="" alt="User" class="story-user-avatar">
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
                    <div class="story-media-container">
                        <!-- Story media will be loaded here -->
                    </div>
                    <button class="story-nav-btn story-next-btn">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        
        // Bind modal events
        this.modal.querySelector('.story-close-btn').addEventListener('click', () => this.closeStory());
        this.modal.querySelector('.story-prev-btn').addEventListener('click', () => this.previousStory());
        this.modal.querySelector('.story-next-btn').addEventListener('click', () => this.nextStory());
        
        // Close on backdrop click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeStory();
            }
        });
        
        this.progressBar = this.modal.querySelector('.story-progress-bar');
    }
    
    async openStory(storyId) {
        try {
            this.currentStoryIndex = this.stories.findIndex(s => s.id == storyId);
            
            if (this.currentStoryIndex === -1) {
                this.currentStoryIndex = 0;
            }
            
            this.showStory();
            this.modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
        } catch (error) {
            console.error('Error loading story:', error);
            this.showErrorMessage('Failed to load story');
        }
    }
    
    showStory() {
        if (!this.stories.length) return;
        
        const story = this.stories[this.currentStoryIndex];
        const mediaContainer = this.modal.querySelector('.story-media-container');
        const userAvatar = this.modal.querySelector('.story-user-avatar');
        const username = this.modal.querySelector('.story-username');
        const storyTime = this.modal.querySelector('.story-time');
        
        // Update user info
        userAvatar.src = story.avatar;
        userAvatar.onerror = () => { userAvatar.src = 'images/profile.jpg'; };
        username.textContent = story.author;
        storyTime.textContent = this.formatTime(story.createdAt);
        
        // Clear previous media
        mediaContainer.innerHTML = '';
        
        // Create media element
        let mediaElement;
        if (story.mediaType === 'video') {
            mediaElement = document.createElement('video');
            mediaElement.controls = false;
            mediaElement.autoplay = true;
            mediaElement.muted = true;
            mediaElement.loop = false;
            mediaElement.addEventListener('ended', () => this.nextStory());
        } else {
            mediaElement = document.createElement('img');
        }
        
        mediaElement.src = story.media;
        mediaElement.className = 'story-media';
        mediaElement.alt = 'Story content';
        
        mediaElement.addEventListener('load', () => {
            this.startProgress();
        });
        
        mediaElement.addEventListener('error', () => {
            this.showErrorMessage('Failed to load media');
        });
        
        mediaContainer.appendChild(mediaElement);
        
        // Update navigation buttons
        const prevBtn = this.modal.querySelector('.story-prev-btn');
        const nextBtn = this.modal.querySelector('.story-next-btn');
        
        prevBtn.style.display = this.currentStoryIndex > 0 ? 'flex' : 'none';
        nextBtn.style.display = this.currentStoryIndex < this.stories.length - 1 ? 'flex' : 'none';
    }
    
    startProgress() {
        this.clearTimer();
        this.progressBar.style.width = '0%';
        this.isPlaying = true;
        
        let progress = 0;
        const increment = 100 / (this.storyDuration / 50);
        
        this.timer = setInterval(() => {
            if (!this.isPlaying) return;
            
            progress += increment;
            this.progressBar.style.width = `${Math.min(progress, 100)}%`;
            
            if (progress >= 100) {
                this.nextStory();
            }
        }, 50);
    }
    
    clearTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    closeStory() {
        this.clearTimer();
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    nextStory() {
        if (this.currentStoryIndex < this.stories.length - 1) {
            this.currentStoryIndex++;
            this.showStory();
        } else {
            this.closeStory();
        }
    }
    
    previousStory() {
        if (this.currentStoryIndex > 0) {
            this.currentStoryIndex--;
            this.showStory();
        }
    }
    
    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        
        if (this.isPlaying) {
            this.startProgress();
        } else {
            this.clearTimer();
        }
    }
    
    formatTime(dateString) {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
        
        return new Date(dateString).toLocaleString(undefined, options);
    }
    
    showErrorMessage(message) {
        // Implement your error handling logic here
        alert(message);
    }
}

// Initialize story viewer
document.addEventListener('DOMContentLoaded', () => {
    new StoryViewer();
});
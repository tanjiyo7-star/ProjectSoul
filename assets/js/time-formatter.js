/**
 * Enhanced Time Formatting System
 * Provides accurate, real-time timestamp updates
 */

class TimeFormatter {
    constructor() {
        this.updateInterval = null;
        this.init();
    }

    init() {
        this.startRealTimeUpdates();
        this.formatAllTimestamps();
    }

    /**
     * Format time ago with proper handling
     */
    formatTimeAgo(dateString) {
        if (!dateString) return 'Unknown time';
        
        const date = new Date(dateString);
        const now = new Date();
        
        // Validate date
        if (isNaN(date.getTime())) {
            console.warn('Invalid date string:', dateString);
            return 'Invalid date';
        }
        
        // Handle future dates (server/client time mismatch)
        if (date > now) {
            return 'Just now';
        }
        
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 10) {
            return 'Just now';
        } else if (diffInSeconds < 60) {
            return `${diffInSeconds}s ago`;
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes}m ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}h ago`;
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days}d ago`;
        } else if (diffInSeconds < 2592000) {
            const weeks = Math.floor(diffInSeconds / 604800);
            return `${weeks}w ago`;
        } else {
            // For older dates, show actual date
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }
    }

    /**
     * Format absolute time
     */
    formatAbsoluteTime(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    /**
     * Format chat time (for message list)
     */
    formatChatTime(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const now = new Date();
        
        if (isNaN(date.getTime())) return '';
        
        const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 0) {
            // Today - show time
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        } else if (diffInDays === 1) {
            return 'Yesterday';
        } else if (diffInDays < 7) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    }

    /**
     * Update all timestamps on the page
     */
    formatAllTimestamps() {
        // Update time-ago elements
        document.querySelectorAll('[data-time-ago]').forEach(element => {
            const dateString = element.getAttribute('data-time-ago') || element.getAttribute('datetime');
            if (dateString) {
                element.textContent = this.formatTimeAgo(dateString);
            }
        });

        // Update notification times
        document.querySelectorAll('.notification-time').forEach(element => {
            const dateString = element.getAttribute('datetime');
            if (dateString) {
                element.textContent = this.formatTimeAgo(dateString);
            }
        });

        // Update post times
        document.querySelectorAll('.post-header time').forEach(element => {
            const dateString = element.getAttribute('datetime');
            if (dateString) {
                element.textContent = this.formatTimeAgo(dateString);
            }
        });

        // Update comment times
        document.querySelectorAll('.comment-time').forEach(element => {
            const dateString = element.getAttribute('datetime');
            if (dateString) {
                element.textContent = this.formatTimeAgo(dateString);
            }
        });

        // Update chat times
        document.querySelectorAll('.chat-time').forEach(element => {
            const dateString = element.getAttribute('data-time');
            if (dateString) {
                element.textContent = this.formatChatTime(dateString);
            }
        });

        // Update message times
        document.querySelectorAll('.message-time span').forEach(element => {
            const messageEl = element.closest('.message');
            const dateString = messageEl?.getAttribute('data-created-at');
            if (dateString) {
                element.textContent = this.formatChatTime(dateString);
            }
        });
    }

    /**
     * Start real-time timestamp updates
     */
    startRealTimeUpdates() {
        // Update every minute
        this.updateInterval = setInterval(() => {
            this.formatAllTimestamps();
        }, 60000);
    }

    /**
     * Add timestamp to new element
     */
    addTimestamp(element, dateString, format = 'ago') {
        if (!element || !dateString) return;
        
        element.setAttribute('datetime', dateString);
        
        switch (format) {
            case 'ago':
                element.textContent = this.formatTimeAgo(dateString);
                break;
            case 'absolute':
                element.textContent = this.formatAbsoluteTime(dateString);
                break;
            case 'chat':
                element.textContent = this.formatChatTime(dateString);
                break;
        }
    }

    /**
     * Get current timestamp in ISO format
     */
    getCurrentTimestamp() {
        return new Date().toISOString();
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Initialize time formatter
let timeFormatter = null;

document.addEventListener('DOMContentLoaded', () => {
    timeFormatter = new TimeFormatter();
    
    // Make it globally available
    window.timeFormatter = timeFormatter;
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (timeFormatter) {
        timeFormatter.destroy();
    }
});

// Export for use in other modules
window.TimeFormatter = TimeFormatter;
/**
 * Double Submit Prevention System
 * Prevents multiple form submissions and button clicks
 */

class DoubleSubmitPrevention {
    constructor() {
        this.submittingForms = new Set();
        this.clickingButtons = new Set();
        this.init();
    }

    init() {
        this.preventFormDoubleSubmit();
        this.preventButtonDoubleClick();
        this.addVisualFeedback();
    }

    /**
     * Prevent double form submissions
     */
    preventFormDoubleSubmit() {
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const formId = form.id || form.action || 'unknown';
            
            // Check if form is already being submitted
            if (this.submittingForms.has(formId)) {
                e.preventDefault();
                console.warn('Form submission prevented - already submitting');
                return false;
            }
            
            // Mark form as submitting
            this.submittingForms.add(formId);
            
            // Add visual feedback
            this.addFormSubmittingState(form);
            
            // Auto-remove after 10 seconds (fallback)
            setTimeout(() => {
                this.submittingForms.delete(formId);
                this.removeFormSubmittingState(form);
            }, 10000);
        });
    }

    /**
     * Prevent double button clicks
     */
    preventButtonDoubleClick() {
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button, .btn, [role="button"]');
            if (!button) return;
            
            // Skip if button is disabled
            if (button.disabled) {
                e.preventDefault();
                return false;
            }
            
            const buttonId = this.getButtonId(button);
            
            // Check if button is already being processed
            if (this.clickingButtons.has(buttonId)) {
                e.preventDefault();
                console.warn('Button click prevented - already processing');
                return false;
            }
            
            // Special handling for friend request buttons
            if (button.classList.contains('accept-btn') || 
                button.classList.contains('decline-btn') ||
                button.classList.contains('add-friend-btn') ||
                button.classList.contains('cancel-request-btn') ||
                button.classList.contains('unfriend-btn')) {
                
                this.handleFriendRequestButton(button, e);
            }
            
            // Special handling for like buttons
            if (button.classList.contains('like-btn')) {
                this.handleLikeButton(button, e);
            }
        });
    }

    /**
     * Handle friend request buttons with prevention
     */
    handleFriendRequestButton(button, event) {
        const buttonId = this.getButtonId(button);
        
        if (this.clickingButtons.has(buttonId)) {
            event.preventDefault();
            return;
        }
        
        // Mark button as processing
        this.clickingButtons.add(buttonId);
        
        // Add visual feedback
        this.addButtonProcessingState(button);
        
        // Auto-remove after 5 seconds (fallback)
        setTimeout(() => {
            this.clickingButtons.delete(buttonId);
            this.removeButtonProcessingState(button);
        }, 5000);
    }

    /**
     * Handle like buttons with debouncing
     */
    handleLikeButton(button, event) {
        const buttonId = this.getButtonId(button);
        
        if (this.clickingButtons.has(buttonId)) {
            event.preventDefault();
            return;
        }
        
        // Mark button as processing (shorter duration for likes)
        this.clickingButtons.add(buttonId);
        
        // Remove after 1 second for likes
        setTimeout(() => {
            this.clickingButtons.delete(buttonId);
        }, 1000);
    }

    /**
     * Get unique button identifier
     */
    getButtonId(button) {
        return button.id || 
               button.dataset.postId || 
               button.dataset.userId || 
               button.dataset.commentId || 
               button.className + '_' + (button.textContent || '').trim();
    }

    /**
     * Add visual feedback for form submission
     */
    addFormSubmittingState(form) {
        form.classList.add('submitting');
        
        // Disable all submit buttons in form
        const submitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
        submitButtons.forEach(btn => {
            btn.disabled = true;
            btn.dataset.originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        });
    }

    /**
     * Remove visual feedback for form submission
     */
    removeFormSubmittingState(form) {
        form.classList.remove('submitting');
        
        // Re-enable submit buttons
        const submitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
        submitButtons.forEach(btn => {
            btn.disabled = false;
            if (btn.dataset.originalText) {
                btn.innerHTML = btn.dataset.originalText;
                delete btn.dataset.originalText;
            }
        });
    }

    /**
     * Add visual feedback for button processing
     */
    addButtonProcessingState(button) {
        button.disabled = true;
        button.classList.add('processing');
        button.dataset.originalText = button.innerHTML;
        
        // Add spinner based on button type
        if (button.classList.contains('accept-btn')) {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Accepting...';
        } else if (button.classList.contains('decline-btn')) {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Declining...';
        } else if (button.classList.contains('add-friend-btn')) {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        } else if (button.classList.contains('cancel-request-btn')) {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cancelling...';
        } else if (button.classList.contains('unfriend-btn')) {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Removing...';
        } else {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        }
    }

    /**
     * Remove visual feedback for button processing
     */
    removeButtonProcessingState(button) {
        button.disabled = false;
        button.classList.remove('processing');
        
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
            delete button.dataset.originalText;
        }
    }

    /**
     * Add visual feedback styles
     */
    addVisualFeedback() {
        const style = document.createElement('style');
        style.textContent = `
            .submitting {
                opacity: 0.7;
                pointer-events: none;
            }
            
            .processing {
                opacity: 0.8;
                transform: scale(0.98);
                transition: all 0.2s ease;
            }
            
            .btn:disabled {
                cursor: not-allowed;
                opacity: 0.6;
            }
            
            .fa-spinner {
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            /* Pulse animation for notifications */
            .pulse {
                animation: pulse 0.6s ease-in-out;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Reset form submission state
     */
    resetFormState(form) {
        const formId = form.id || form.action || 'unknown';
        this.submittingForms.delete(formId);
        this.removeFormSubmittingState(form);
    }

    /**
     * Reset button state
     */
    resetButtonState(button) {
        const buttonId = this.getButtonId(button);
        this.clickingButtons.delete(buttonId);
        this.removeButtonProcessingState(button);
    }

    /**
     * Check if form is submitting
     */
    isFormSubmitting(form) {
        const formId = form.id || form.action || 'unknown';
        return this.submittingForms.has(formId);
    }

    /**
     * Check if button is processing
     */
    isButtonProcessing(button) {
        const buttonId = this.getButtonId(button);
        return this.clickingButtons.has(buttonId);
    }
}

// Initialize double submit prevention
let doubleSubmitPrevention = null;

document.addEventListener('DOMContentLoaded', () => {
    doubleSubmitPrevention = new DoubleSubmitPrevention();
    window.doubleSubmitPrevention = doubleSubmitPrevention;
});

// Export for use in other modules
window.DoubleSubmitPrevention = DoubleSubmitPrevention;
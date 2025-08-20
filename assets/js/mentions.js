/**
 * Mentions System JavaScript
 * Handles @mentions functionality with friend suggestions
 */

class MentionsSystem {
    constructor() {
        this.friends = window.userFriends || [];
        this.currentInput = null;
        this.dropdown = null;
        this.selectedIndex = -1;
        
        this.init();
    }
    
    init() {
        this.createDropdown();
        this.bindEvents();
    }
    
    createDropdown() {
        this.dropdown = document.getElementById('mentionsDropdown');
        if (!this.dropdown) {
            this.dropdown = document.createElement('div');
            this.dropdown.id = 'mentionsDropdown';
            this.dropdown.className = 'mentions-dropdown';
            document.body.appendChild(this.dropdown);
        }
    }
    
    bindEvents() {
        // Handle input events on mention-enabled inputs
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('mentions-input')) {
                this.handleInput(e);
            }
        });
        
        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('mentions-input') && this.dropdown.style.display === 'block') {
                this.handleKeydown(e);
            }
        });
        
        // Hide dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.mentions-dropdown') && !e.target.classList.contains('mentions-input')) {
                this.hideDropdown();
            }
        });
    }
    
    handleInput(event) {
        const input = event.target;
        const value = input.value;
        const cursorPos = input.selectionStart;
        
        // Find @ symbol before cursor
        const textBeforeCursor = value.substring(0, cursorPos);
        const atIndex = textBeforeCursor.lastIndexOf('@');
        
        if (atIndex !== -1) {
            const searchTerm = textBeforeCursor.substring(atIndex + 1);
            
            // Only show suggestions if @ is at start or after space
            const charBeforeAt = atIndex > 0 ? textBeforeCursor[atIndex - 1] : ' ';
            if (charBeforeAt === ' ' || atIndex === 0) {
                this.currentInput = input;
                this.showSuggestions(searchTerm, input, atIndex);
                return;
            }
        }
        
        this.hideDropdown();
    }
    
    handleKeydown(event) {
        const suggestions = this.dropdown.querySelectorAll('.mention-suggestion');
        
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, suggestions.length - 1);
                this.updateSelection(suggestions);
                break;
                
            case 'ArrowUp':
                event.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                this.updateSelection(suggestions);
                break;
                
            case 'Enter':
                if (this.selectedIndex >= 0 && suggestions[this.selectedIndex]) {
                    event.preventDefault();
                    this.selectSuggestion(suggestions[this.selectedIndex]);
                }
                break;
                
            case 'Escape':
                this.hideDropdown();
                break;
        }
    }
    
    showSuggestions(searchTerm, input, atIndex) {
        const filteredFriends = this.friends.filter(friend => 
            friend.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            friend.lastName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (filteredFriends.length === 0) {
            this.hideDropdown();
            return;
        }
        
        // Position dropdown
        const rect = input.getBoundingClientRect();
        const inputStyle = window.getComputedStyle(input);
        const fontSize = parseInt(inputStyle.fontSize);
        
        this.dropdown.style.position = 'absolute';
        this.dropdown.style.left = rect.left + 'px';
        this.dropdown.style.top = (rect.bottom + 5) + 'px';
        this.dropdown.style.width = Math.min(300, rect.width) + 'px';
        this.dropdown.style.zIndex = '1000';
        
        // Populate suggestions
        this.dropdown.innerHTML = filteredFriends.map((friend, index) => `
            <div class="mention-suggestion" data-friend-id="${friend.id}" data-index="${index}">
                <img src="${friend.avatar || 'images/profile.jpg'}" 
                     alt="${friend.firstName}" 
                     class="suggestion-avatar"
                     onerror="this.src='images/profile.jpg'">
                <div class="suggestion-info">
                    <span class="suggestion-name">${friend.firstName} ${friend.lastName}</span>
                    <span class="suggestion-username">@${friend.firstName.toLowerCase()}</span>
                </div>
            </div>
        `).join('');
        
        // Add click handlers
        this.dropdown.querySelectorAll('.mention-suggestion').forEach(suggestion => {
            suggestion.addEventListener('click', () => this.selectSuggestion(suggestion));
        });
        
        this.dropdown.style.display = 'block';
        this.selectedIndex = -1;
    }
    
    updateSelection(suggestions) {
        suggestions.forEach((suggestion, index) => {
            suggestion.classList.toggle('selected', index === this.selectedIndex);
        });
    }
    
    selectSuggestion(suggestion) {
        if (!this.currentInput) return;
        
        const friendId = suggestion.dataset.friendId;
        const friend = this.friends.find(f => f.id == friendId);
        if (!friend) return;
        
        const value = this.currentInput.value;
        const cursorPos = this.currentInput.selectionStart;
        const textBeforeCursor = value.substring(0, cursorPos);
        const atIndex = textBeforeCursor.lastIndexOf('@');
        
        // Replace @searchTerm with @friendName
        const beforeAt = value.substring(0, atIndex);
        const afterCursor = value.substring(cursorPos);
        const mention = `@${friend.firstName}`;
        
        this.currentInput.value = beforeAt + mention + ' ' + afterCursor;
        this.currentInput.focus();
        
        // Set cursor position after mention
        const newCursorPos = atIndex + mention.length + 1;
        this.currentInput.setSelectionRange(newCursorPos, newCursorPos);
        
        this.hideDropdown();
    }
    
    hideDropdown() {
        this.dropdown.style.display = 'none';
        this.selectedIndex = -1;
        this.currentInput = null;
    }
}

// Initialize mentions system
document.addEventListener('DOMContentLoaded', () => {
    new MentionsSystem();
});

// Add CSS for mentions
const mentionsStyle = document.createElement('style');
mentionsStyle.textContent = `
    .mentions-dropdown {
        background: white;
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-medium);
        max-height: 200px;
        overflow-y: auto;
        display: none;
    }
    
    .mention-suggestion {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm);
        cursor: pointer;
        transition: background-color 0.2s ease;
    }
    
    .mention-suggestion:hover,
    .mention-suggestion.selected {
        background-color: var(--accent-color);
    }
    
    .suggestion-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
    }
    
    .suggestion-info {
        display: flex;
        flex-direction: column;
    }
    
    .suggestion-name {
        font-weight: 600;
        font-size: 0.9rem;
        color: var(--text-primary);
    }
    
    .suggestion-username {
        font-size: 0.8rem;
        color: var(--text-muted);
    }
    
    .mention {
        color: var(--primary-color);
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
    }
    
    .mention:hover {
        text-decoration: underline;
    }
`;
document.head.appendChild(mentionsStyle);
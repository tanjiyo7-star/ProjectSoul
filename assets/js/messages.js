// Messages functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeMessages();
});

function initializeMessages() {
    // Auto-scroll to bottom of messages
    const messagesArea = document.getElementById('messagesArea');
    if (messagesArea) {
        scrollToBottom(messagesArea);
    }
    
    // Handle message form submission
    const messageForm = document.getElementById('messageForm');
    if (messageForm) {
        messageForm.addEventListener('submit', handleMessageSubmit);
    }
    
    // Handle new chat modal
    const newChatBtn = document.getElementById('newChatBtn');
    const startChatBtn = document.getElementById('startChatBtn');
    const newChatModal = document.getElementById('newChatModal');
    const closeModal = document.getElementById('closeModal');
    
    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => showModal(newChatModal));
    }
    
    if (startChatBtn) {
        startChatBtn.addEventListener('click', () => showModal(newChatModal));
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', () => hideModal(newChatModal));
    }
    
    if (newChatModal) {
        newChatModal.addEventListener('click', (e) => {
            if (e.target === newChatModal) {
                hideModal(newChatModal);
            }
        });
    }
    
    // Handle chat search
    const chatSearch = document.getElementById('chatSearch');
    if (chatSearch) {
        chatSearch.addEventListener('input', handleChatSearch);
    }
    
    // Handle user search in modal
    const userSearch = document.getElementById('userSearch');
    if (userSearch) {
        userSearch.addEventListener('input', handleUserSearch);
    }
    
    // Auto-refresh messages if in a chat
    if (chatId) {
        startMessagePolling();
    }
    
    // Handle Enter key in message input
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                messageForm.dispatchEvent(new Event('submit'));
            }
        });
        
        // Auto-focus message input
        messageInput.focus();
    }
}

async function handleMessageSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const messageInput = form.querySelector('input[name="message"]');
    const sendBtn = form.querySelector('.send-btn');
    
    if (!messageInput.value.trim()) {
        return;
    }
    
    // Disable form while sending
    messageInput.disabled = true;
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    try {
        const response = await fetch('/sendMessage', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            // Clear input
            messageInput.value = '';
            
            // Add message to UI immediately for better UX
            addMessageToUI({
                content: formData.get('message'),
                senderId: currentUserId,
                created_at: new Date().toISOString(),
                isSent: true
            });
            
            // Scroll to bottom
            const messagesArea = document.getElementById('messagesArea');
            if (messagesArea) {
                scrollToBottom(messagesArea);
            }
        } else {
            throw new Error('Failed to send message');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showToast('Failed to send message', 'error');
    } finally {
        // Re-enable form
        messageInput.disabled = false;
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        messageInput.focus();
    }
}

function addMessageToUI(message) {
    const messagesArea = document.getElementById('messagesArea');
    if (!messagesArea) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.senderId == currentUserId ? 'sent' : 'received'}`;
    
    const time = new Date(message.created_at);
    const timeString = time.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
    
    messageElement.innerHTML = `
        ${message.senderId != currentUserId ? `
            <img src="${message.avatar || 'images/profile.jpg'}" 
                 alt="${message.firstName || 'User'}" 
                 class="message-avatar">
        ` : ''}
        <div class="message-content">
            <div class="message-bubble">
                ${escapeHtml(message.content)}
            </div>
            <div class="message-time">
                ${timeString}
            </div>
        </div>
    `;
    
    messagesArea.appendChild(messageElement);
}

function handleChatSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const chatItems = document.querySelectorAll('.chat-item');
    
    chatItems.forEach(item => {
        const name = item.querySelector('.chat-name').textContent.toLowerCase();
        const preview = item.querySelector('.chat-preview').textContent.toLowerCase();
        
        if (name.includes(searchTerm) || preview.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function handleUserSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const userItems = document.querySelectorAll('.user-item');
    
    userItems.forEach(item => {
        const name = item.querySelector('span').textContent.toLowerCase();
        
        if (name.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function startChat(userId) {
    window.location.href = `/message?start_chat=1&user_id=${userId}`;
}

function showModal(modal) {
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modal) {
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function scrollToBottom(element) {
    element.scrollTop = element.scrollHeight;
}

function showToast(message, type = 'info') {
    // Create toast if it doesn't exist
    let toast = document.getElementById('messageToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'messageToast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Message polling for real-time updates
let pollingInterval;
let pollingErrorCount = 0;
const MAX_POLLING_ERRORS = 5;

function startMessagePolling() {
    pollingErrorCount = 0; // reset on start
    // Poll every 3 seconds for new messages
    pollingInterval = setInterval(async () => {
        try {
            // Make sure this endpoint exists and is correct in your backend:
            // /api/messages/:chatId/latest
            const response = await fetch(`/api/messages/${chatId}/latest.php`);
            if (response.ok) {
                pollingErrorCount = 0; // reset on success
                const data = await response.json();
                if (data.messages && data.messages.length > 0) {
                    const messagesArea = document.getElementById('messagesArea');
                    const lastMessage = messagesArea.lastElementChild;
                    const lastMessageTime = lastMessage ? 
                        lastMessage.querySelector('.message-time').textContent : '';
                    
                    // Add new messages
                    data.messages.forEach(message => {
                        const messageTime = new Date(message.created_at).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: false 
                        });
                        
                        // Only add if it's newer than the last message
                        if (messageTime !== lastMessageTime) {
                            addMessageToUI(message);
                        }
                    });
                    
                    scrollToBottom(messagesArea);
                }
            } else {
                // Handle 404 error specifically
                if (response.status === 404) {
                    clearInterval(pollingInterval);
                    showToast('Chat not found. Message updates stopped.', 'error');
                    return;
                }
                pollingErrorCount++;
                if (pollingErrorCount >= MAX_POLLING_ERRORS) {
                    clearInterval(pollingInterval);
                    showToast('Message updates stopped due to repeated errors.', 'error');
                }
            }
        } catch (error) {
            pollingErrorCount++;
            console.error('Error polling messages:', error);
            if (pollingErrorCount >= MAX_POLLING_ERRORS) {
                clearInterval(pollingInterval);
                showToast('Message updates stopped due to repeated errors.', 'error');
            }
        }
    }, 3000);
}

// Clean up polling when leaving the page
window.addEventListener('beforeunload', () => {
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    if (chatId && !pollingInterval) {
        startMessagePolling();
    }
});

window.addEventListener('offline', () => {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
});

// Emoji picker functionality (basic)
document.addEventListener('click', function(e) {
    if (e.target.closest('.emoji-btn')) {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            // Simple emoji insertion - you can expand this with a proper emoji picker
            const emojis = ['😀', '😂', '😍', '🤔', '👍', '❤️', '🎉', '🔥'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            messageInput.value += randomEmoji;
            messageInput.focus();
        }
    }
});

// Add toast styles if not already present
if (!document.querySelector('#toastStyles')) {
    const toastStyles = document.createElement('style');
    toastStyles.id = 'toastStyles';
    toastStyles.textContent = `
        .toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #14171a;
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            font-weight: 600;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .toast.show {
            transform: translateX(0);
        }
        
        .toast.success {
            background: #17bf63;
        }
        
        .toast.error {
            background: #e0245e;
        }
        
        @media (max-width: 480px) {
            .toast {
                bottom: 15px;
                right: 15px;
                left: 15px;
                text-align: center;
            }
        }
    `;
    document.head.appendChild(toastStyles);
}
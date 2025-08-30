/**
 * SoulBridge WebSocket Client
 * Handles real-time communication with WebSocket server
 */

class SoulBridgeWebSocket {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.isConnected = false;
        this.messageQueue = [];
        this.currentChatId = null;
        this.typingTimeout = null;
        this.heartbeatInterval = null;
        
        this.init();
    }

    init() {
        this.connect();
        this.setupEventListeners();
        this.startHeartbeat();
    }

    connect() {
        try {
            // Get session ID from PHP
            const sessionId = this.getSessionId();
            if (!sessionId) {
                console.error('No session ID found');
                return;
            }

            const wsUrl = `ws://localhost:8080/websocket?session_id=${sessionId}`;
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = (event) => {
                console.log('Connected to SoulBridge WebSocket');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.processMessageQueue();
                this.showConnectionStatus('Connected', 'success');
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            this.ws.onclose = (event) => {
                console.log('WebSocket connection closed');
                this.isConnected = false;
                this.showConnectionStatus('Disconnected', 'error');
                this.attemptReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.showConnectionStatus('Connection Error', 'error');
            };

        } catch (error) {
            console.error('Error creating WebSocket connection:', error);
            this.attemptReconnect();
        }
    }

    handleMessage(data) {
        switch (data.type) {
            case 'connected':
                this.handleConnected(data);
                break;
                
            case 'new_message':
                this.handleNewMessage(data);
                break;
                
            case 'typing_start':
                this.handleTypingStart(data);
                break;
                
            case 'typing_stop':
                this.handleTypingStop(data);
                break;
                
            case 'messages_read':
                this.handleMessagesRead(data);
                break;
                
            case 'notification':
                this.handleNotification(data);
                break;
                
            case 'friend_request':
                this.handleFriendRequest(data);
                break;
                
            case 'new_post':
                this.handleNewPost(data);
                break;
                
            case 'user_status':
                this.handleUserStatus(data);
                break;
                
            case 'heartbeat_response':
                // Connection is alive
                break;
                
            default:
                console.log('Unknown message type:', data.type);
        }
    }

    handleConnected(data) {
        console.log('Successfully connected as user:', data.userId);
        
        // Join current chat if on message page
        if (this.currentChatId) {
            this.joinChat(this.currentChatId);
        }
    }

    handleNewMessage(data) {
        // Add message to UI
        this.addMessageToUI(data);
        
        // Update chat list
        this.updateChatList(data);
        
        // Show notification if not in current chat
        if (data.chatId !== this.currentChatId) {
            this.showMessageNotification(data);
        }
        
        // Update unread counts
        this.updateMessageCounts();
    }

    handleTypingStart(data) {
        if (data.chatId === this.currentChatId) {
            this.showTypingIndicator(data.userName);
        }
    }

    handleTypingStop(data) {
        if (data.chatId === this.currentChatId) {
            this.hideTypingIndicator(data.userId);
        }
    }

    handleMessagesRead(data) {
        // Update message read status in UI
        data.messageIds.forEach(messageId => {
            const messageEl = document.querySelector(`[data-message-id="${messageId}"]`);
            if (messageEl) {
                const statusIcon = messageEl.querySelector('.message-status i');
                if (statusIcon) {
                    statusIcon.classList.add('read');
                }
            }
        });
    }

    handleNotification(data) {
        // Update notification count
        this.updateNotificationBadge(data.data);
        
        // Show desktop notification
        this.showDesktopNotification(data.data);
        
        // Add to notification list if on notifications page
        if (window.location.pathname === '/notification') {
            this.addNotificationToList(data.data);
        }
    }

    handleFriendRequest(data) {
        // Update friend request count
        this.updateFriendRequestCount(1);
        
        // Show notification
        this.showToast(`${data.request.senderName} sent you a friend request`, 'info');
        
        // Add to friend requests list if on home page
        if (window.location.pathname === '/home') {
            this.addFriendRequestToList(data.request);
        }
    }

    handleNewPost(data) {
        // Show new post indicator
        this.showNewPostIndicator(data.post);
        
        // Add to feed if user wants real-time updates
        if (this.shouldShowNewPosts()) {
            this.addPostToFeed(data.post);
        }
    }

    handleUserStatus(data) {
        // Update online indicators
        const indicators = document.querySelectorAll(`[data-user-id="${data.userId}"] .online-indicator`);
        indicators.forEach(indicator => {
            if (data.status === 'online') {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
        
        // Update partner status in chat
        const partnerStatus = document.querySelector('.partner-status');
        if (partnerStatus && partnerStatus.dataset.userId == data.userId) {
            partnerStatus.textContent = data.status === 'online' ? 'Active now' : 'Offline';
            partnerStatus.classList.toggle('online', data.status === 'online');
        }
    }

    // Message sending methods
    sendMessage(chatId, message, messageType = 'text', mediaUrl = null) {
        const messageData = {
            type: 'send_message',
            chatId: chatId,
            message: message,
            messageType: messageType,
            mediaUrl: mediaUrl
        };
        
        this.send(messageData);
    }

    startTyping(chatId) {
        clearTimeout(this.typingTimeout);
        
        this.send({
            type: 'typing_start',
            chatId: chatId
        });
        
        // Auto-stop typing after 3 seconds
        this.typingTimeout = setTimeout(() => {
            this.stopTyping(chatId);
        }, 3000);
    }

    stopTyping(chatId) {
        clearTimeout(this.typingTimeout);
        
        this.send({
            type: 'typing_stop',
            chatId: chatId
        });
    }

    markMessagesRead(chatId, messageIds) {
        this.send({
            type: 'mark_read',
            chatId: chatId,
            messageIds: messageIds
        });
    }

    joinChat(chatId) {
        this.currentChatId = chatId;
        this.send({
            type: 'join_chat',
            chatId: chatId
        });
    }

    leaveChat(chatId) {
        this.send({
            type: 'leave_chat',
            chatId: chatId
        });
        this.currentChatId = null;
    }

    // Utility methods
    send(data) {
        if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            // Queue message for when connection is restored
            this.messageQueue.push(data);
        }
    }

    processMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.send(message);
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            
            console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
            this.showConnectionStatus(`Reconnecting in ${delay/1000}s...`, 'warning');
            
            setTimeout(() => {
                this.connect();
            }, delay);
        } else {
            console.error('Max reconnection attempts reached');
            this.showConnectionStatus('Connection Failed', 'error');
        }
    }

    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.isConnected) {
                this.send({ type: 'heartbeat' });
            }
        }, 30000); // Every 30 seconds
    }

    setupEventListeners() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page hidden - reduce activity
            } else {
                // Page visible - ensure connection
                if (!this.isConnected) {
                    this.connect();
                }
            }
        });

        // Handle beforeunload
        window.addEventListener('beforeunload', () => {
            if (this.ws) {
                this.ws.close();
            }
        });
    }

    getSessionId() {
        // Get PHP session ID from cookie
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'PHPSESSID') {
                return value;
            }
        }
        return null;
    }

    // UI Update Methods
    addMessageToUI(data) {
        const messagesArea = document.getElementById('messagesArea');
        if (!messagesArea) return;

        // Check if message already exists (prevent duplicates)
        if (document.getElementById(`msg-${data.messageId}`)) {
            return;
        }

        const messageEl = document.createElement('div');
        messageEl.id = `msg-${data.messageId}`;
        messageEl.className = `message ${data.senderId == window.currentUserId ? 'sent' : 'received'}`;
        
        const time = new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
        });

        let mediaContent = '';
        if (data.messageType === 'image') {
            mediaContent = `<img src="${data.mediaUrl}" alt="Image" class="message-image" onclick="openImageModal('${data.mediaUrl}')">`;
        } else if (data.messageType === 'gif') {
            mediaContent = `<img src="${data.mediaUrl}" alt="GIF" class="message-gif">`;
        } else if (data.messageType === 'sticker') {
            mediaContent = `<img src="${data.mediaUrl}" alt="Sticker" class="message-sticker">`;
        }

        messageEl.innerHTML = `
            ${data.senderId != window.currentUserId ? `
                <img src="${data.senderAvatar}" alt="${data.senderName}" class="message-avatar">
            ` : ''}
            <div class="message-content">
                <div class="message-bubble">
                    ${mediaContent}
                    ${data.message ? `<p>${this.escapeHtml(data.message)}</p>` : ''}
                </div>
                <div class="message-time">
                    <span>${time}</span>
                    ${data.senderId == window.currentUserId ? `
                        <span class="message-status" data-message-id="${data.messageId}">
                            <i class="fas fa-check-circle"></i>
                        </span>
                    ` : ''}
                </div>
            </div>
        `;

        messagesArea.appendChild(messageEl);
        
        // Auto-scroll if user is at bottom
        if (this.isAtBottom(messagesArea)) {
            this.scrollToBottom(messagesArea);
        }

        // Mark as read if visible
        if (data.senderId != window.currentUserId && this.isAtBottom(messagesArea)) {
            setTimeout(() => {
                this.markMessagesRead(data.chatId, [data.messageId]);
            }, 1000);
        }
    }

    updateChatList(data) {
        const chatItem = document.querySelector(`[data-user-id="${data.senderId}"]`);
        if (chatItem) {
            const preview = chatItem.querySelector('.chat-preview');
            const time = chatItem.querySelector('.chat-time');
            const unreadBadge = chatItem.querySelector('.unread-badge');
            
            if (preview) {
                preview.textContent = data.message.substring(0, 50) + (data.message.length > 50 ? '...' : '');
            }
            
            if (time) {
                time.textContent = new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: false 
                });
            }
            
            // Update unread count
            if (data.senderId != window.currentUserId) {
                if (unreadBadge) {
                    const count = parseInt(unreadBadge.textContent) + 1;
                    unreadBadge.textContent = count;
                } else {
                    const badge = document.createElement('div');
                    badge.className = 'unread-badge';
                    badge.textContent = '1';
                    chatItem.querySelector('.chat-meta').appendChild(badge);
                }
            }
        }
    }

    showTypingIndicator(userName) {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.textContent = `${userName} is typing...`;
            typingIndicator.style.display = 'block';
        }
    }

    hideTypingIndicator(userId) {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
    }

    updateNotificationBadge(notification) {
        // Update notification count in navigation
        const notificationBadge = document.getElementById('notification-count');
        if (notificationBadge) {
            const count = parseInt(notificationBadge.textContent || '0') + 1;
            notificationBadge.textContent = count;
            notificationBadge.style.display = 'inline';
            
            // Add pulse animation
            notificationBadge.classList.add('pulse');
            setTimeout(() => notificationBadge.classList.remove('pulse'), 1000);
        }

        // Update mobile menu badge
        this.updateMobileBadge('notifications', 1);
    }

    updateMessageCounts() {
        // This will be called to update message counts
        const messageBadge = document.getElementById('message-count');
        if (messageBadge) {
            const count = parseInt(messageBadge.textContent || '0') + 1;
            messageBadge.textContent = count;
            messageBadge.style.display = 'inline';
        }

        // Update mobile menu badge
        this.updateMobileBadge('messages', 1);
    }

    updateFriendRequestCount(change) {
        const friendRequestBadge = document.querySelector('.sidebar-card .badge');
        if (friendRequestBadge) {
            const count = Math.max(0, parseInt(friendRequestBadge.textContent || '0') + change);
            friendRequestBadge.textContent = count;
            friendRequestBadge.style.display = count > 0 ? 'inline' : 'none';
        }

        // Update mobile menu badge
        this.updateMobileBadge('friend-requests', change);
    }

    updateMobileBadge(type, change) {
        const mobileMenu = document.getElementById('mobileMenu');
        if (!mobileMenu) return;

        let badgeSelector = '';
        switch (type) {
            case 'notifications':
                badgeSelector = '.mobile-nav-item[href="/notification"] .notification-badge';
                break;
            case 'messages':
                badgeSelector = '.mobile-nav-item[href="/message"] .notification-badge';
                break;
            case 'friend-requests':
                badgeSelector = '.mobile-nav-item[href="/home"] .notification-badge';
                break;
        }

        let badge = mobileMenu.querySelector(badgeSelector);
        if (!badge && change > 0) {
            // Create badge
            const navItem = mobileMenu.querySelector(badgeSelector.split(' .notification-badge')[0]);
            if (navItem) {
                badge = document.createElement('span');
                badge.className = 'notification-badge';
                navItem.appendChild(badge);
            }
        }

        if (badge) {
            const count = Math.max(0, parseInt(badge.textContent || '0') + change);
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline' : 'none';
        }
    }

    showMessageNotification(data) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`New message from ${data.senderName}`, {
                body: data.message,
                icon: data.senderAvatar,
                badge: '/images/SB1.png'
            });
        }
    }

    showDesktopNotification(notification) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('SoulBridge Notification', {
                body: notification.message,
                icon: '/images/SB1.png',
                badge: '/images/SB1.png'
            });
        }
    }

    showConnectionStatus(message, type) {
        // Show connection status in UI
        const statusEl = document.getElementById('connectionStatus');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = `connection-status ${type}`;
            statusEl.style.display = 'block';
            
            if (type === 'success') {
                setTimeout(() => {
                    statusEl.style.display = 'none';
                }, 3000);
            }
        }
    }

    showToast(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        const container = document.getElementById('toast-container') || document.body;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // Utility methods
    isAtBottom(element) {
        return element.scrollTop + element.clientHeight >= element.scrollHeight - 50;
    }

    scrollToBottom(element) {
        element.scrollTop = element.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    shouldShowNewPosts() {
        // Check user preference or if they're at top of feed
        const feed = document.getElementById('posts-feed');
        return feed && feed.scrollTop < 100;
    }

    addPostToFeed(post) {
        // Add new post to top of feed
        const feed = document.getElementById('posts-feed');
        if (!feed) return;

        // Create post element and insert at top
        const postEl = this.createPostElement(post);
        feed.insertBefore(postEl, feed.firstChild);
    }

    createPostElement(post) {
        // Create post HTML element
        const article = document.createElement('article');
        article.className = 'post-card';
        article.dataset.postId = post.id;
        
        // Add post content (simplified for brevity)
        article.innerHTML = `
            <header class="post-header">
                <div class="post-author">
                    <img src="${post.authorAvatar}" alt="${post.authorName}" class="author-avatar">
                    <div class="author-info">
                        <h4>${post.authorName}</h4>
                        <time>Just now</time>
                    </div>
                </div>
            </header>
            <div class="post-content">
                <p>${this.escapeHtml(post.content)}</p>
            </div>
            <!-- Add more post elements as needed -->
        `;
        
        return article;
    }

    addNotificationToList(notification) {
        const notificationsList = document.getElementById('notificationsList');
        if (!notificationsList) return;

        const notificationEl = document.createElement('div');
        notificationEl.className = 'notification-item unread';
        notificationEl.innerHTML = `
            <div class="notification-avatar">
                <img src="${notification.avatar}" alt="Profile">
                <div class="unread-indicator"></div>
            </div>
            <div class="notification-content">
                <div class="notification-text">
                    <strong>${notification.senderName}</strong> ${notification.message}
                </div>
                <div class="notification-meta">
                    <time>Just now</time>
                    <span class="unread-badge">New</span>
                </div>
            </div>
        `;
        
        notificationsList.insertBefore(notificationEl, notificationsList.firstChild);
    }

    addFriendRequestToList(request) {
        const friendRequestsContainer = document.querySelector('.sidebar-card .card-content');
        if (!friendRequestsContainer) return;

        const requestEl = document.createElement('div');
        requestEl.className = 'friend-request';
        requestEl.dataset.userId = request.senderId;
        requestEl.innerHTML = `
            <div class="request-info">
                <div class="profile-photo">
                    <img src="${request.senderAvatar}" alt="Profile Picture">
                </div>
                <div class="request-details">
                    <h4>${request.senderName}</h4>
                    <p class="mutual-friends">0 mutual friends</p>
                </div>
            </div>
            <div class="request-actions">
                <button class="btn btn-primary accept-btn">Accept</button>
                <button class="btn btn-secondary decline-btn">Decline</button>
            </div>
        `;
        
        friendRequestsContainer.appendChild(requestEl);
    }

    showNewPostIndicator(post) {
        const feed = document.getElementById('posts-feed');
        if (!feed) return;

        // Remove existing indicator
        const existing = document.querySelector('.new-posts-indicator');
        if (existing) existing.remove();

        // Create new indicator
        const indicator = document.createElement('div');
        indicator.className = 'new-posts-indicator';
        indicator.innerHTML = `
            <div class="indicator-content">
                <i class="fas fa-arrow-up"></i>
                <span>New post from ${post.authorName}</span>
                <button onclick="window.location.reload()" class="refresh-btn">
                    <i class="fas fa-sync"></i> View
                </button>
                <button onclick="this.parentElement.parentElement.remove()" class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        feed.insertBefore(indicator, feed.firstChild);
    }

    // Cleanup
    disconnect() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        
        if (this.ws) {
            this.ws.close();
        }
    }
}

// Initialize WebSocket when DOM is loaded
let soulBridgeWS = null;

document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if user is logged in
    if (window.currentUserId) {
        soulBridgeWS = new SoulBridgeWebSocket();
        
        // Make it globally available
        window.soulBridgeWS = soulBridgeWS;
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (soulBridgeWS) {
        soulBridgeWS.disconnect();
    }
});
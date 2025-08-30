// Messages functionality (DEDUP + SMART AUTOSCROLL)
document.addEventListener('DOMContentLoaded', function () {
    initializeMessages();
});

let pollingInterval;
let pollingErrorCount = 0;
const MAX_POLLING_ERRORS = 5;
let lastMessageId = 0;
let initialScrollDone = false;
let hasUserManuallyScrolledUp = false;

// NEW: keyboard/viewport helpers
let visualViewportListener = null;
let originalMessagesAreaPaddingBottom = '';

function initializeMessages() {
    const messagesArea = document.getElementById('messagesArea');
    if (messagesArea) {
        // DOM ထဲက နောက်ဆုံး msg id ကို ခေါ်ယူပြီး lastMessageId အဖြစ်သတ်မှတ်
        lastMessageId = getLastMessageIdFromDOM() || 0;

        // First load မှာ bottom ဆွဲချ (messages ရှိရင်ပဲ)
        if (!initialScrollDone) {
            scrollToBottom(messagesArea);
            initialScrollDone = true;

            // <<< NEW: initial load မှာ bottom ရှိရင် visible received မက်ဆေ့များကို mark read ခေါ်တယ် >>>
            markMessagesAsRead();
        }

        // user manual scroll ကို track
        messagesArea.addEventListener('scroll', () => {
            hasUserManuallyScrolledUp = !isAtBottom(messagesArea);
        });
    }

    // form submit
    const messageForm = document.getElementById('messageForm');
    if (messageForm) {
        messageForm.addEventListener('submit', handleMessageSubmit);
    }

    // Enter => submit + input focus handling
    const messageInput = document.getElementById('messageInput');
    if (messageInput && messageForm) {
        messageInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                messageForm.dispatchEvent(new Event('submit'));
            }
        });
        messageInput.focus();

        // NEW: focus/blur handlers to improve mobile layout when keyboard opens
        messageInput.addEventListener('focus', handleInputFocus);
        messageInput.addEventListener('blur', handleInputBlur);
    }

    // Polling on
    if (typeof chatId !== 'undefined' && chatId) {
        startMessagePolling();
    }
}

// NEW: adjust messages-area padding when virtual keyboard is present
function adjustForKeyboard() {
    const area = document.getElementById('messagesArea');
    if (!area) return;

    // Keep a safe extra so recent messages + input are visible
    const SAFETY = 80;

    if (window.visualViewport) {
        const kbHeight = Math.max(0, window.innerHeight - window.visualViewport.height);
        area.style.paddingBottom = (kbHeight + SAFETY) + 'px';
    } else {
        // Fallback for browsers without visualViewport API
        area.style.paddingBottom = '300px';
    }
}

// NEW: on input focus hide header and tune padding/scroll
function handleInputFocus() {
    const chatArea = document.querySelector('.chat-area');
    const area = document.getElementById('messagesArea');
    if (!chatArea || !area) return;

    // store original padding to restore on blur
    originalMessagesAreaPaddingBottom = area.style.paddingBottom || '';

    chatArea.classList.add('typing');

    // adjust immediately and also when visualViewport changes
    adjustForKeyboard();
    if (window.visualViewport) {
        visualViewportListener = () => {
            adjustForKeyboard();
            scrollToBottom(area);
        };
        window.visualViewport.addEventListener('resize', visualViewportListener);
    }

    // small delay to allow keyboard to appear then scroll
    setTimeout(() => {
        scrollToBottom(area);
        // <<< NEW: input ကို focus လုပ်တဲ့အခါ user က message တွေကို ကြည့်နေရင် mark read ပြုလုပ်ရန် >>>
        markMessagesAsRead();
    }, 300);
}

// NEW: restore layout on blur
function handleInputBlur() {
    const chatArea = document.querySelector('.chat-area');
    const area = document.getElementById('messagesArea');
    if (!chatArea || !area) return;

    chatArea.classList.remove('typing');

    // restore padding
    area.style.paddingBottom = originalMessagesAreaPaddingBottom || '';

    if (window.visualViewport && visualViewportListener) {
        window.visualViewport.removeEventListener('resize', visualViewportListener);
        visualViewportListener = null;
    }

    // small delay then ensure scroll
    setTimeout(() => scrollToBottom(area), 150);
}

// ---- Helpers ----
function getLastMessageIdFromDOM() {
    const messagesArea = document.getElementById('messagesArea');
    if (!messagesArea) return 0;
    // Find the highest numeric msg-<id> among children to avoid tmp nodes or non-message elements
    let maxId = 0;
    const children = messagesArea.children;
    for (let i = 0; i < children.length; i++) {
        const idAttr = children[i].id || '';
        if (idAttr.startsWith('msg-')) {
            const n = parseInt(idAttr.replace('msg-', ''), 10);
            if (!Number.isNaN(n) && n > maxId) maxId = n;
        }
    }
    return maxId;
}

function isAtBottom(el) {
    return el.scrollTop + el.clientHeight >= el.scrollHeight - 50;
}

function scrollToBottom(element) {
    element.scrollTop = element.scrollHeight;
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

function handleChatSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => {
        const name = item.querySelector('.chat-name')?.textContent.toLowerCase() || '';
        const preview = item.querySelector('.chat-preview')?.textContent.toLowerCase() || '';
        item.style.display = (name.includes(searchTerm) || preview.includes(searchTerm)) ? 'flex' : 'none';
    });
}

function handleUserSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const userItems = document.querySelectorAll('.user-item');
    userItems.forEach(item => {
        const name = item.querySelector('span')?.textContent.toLowerCase() || '';
        item.style.display = name.includes(searchTerm) ? 'flex' : 'none';
    });
}

function showToast(message, type = 'info') {
    let toast = document.getElementById('messageToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'messageToast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ---- Send message (optimistic UI + reconcile) ----
async function handleMessageSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const messageInput = form.querySelector('input[name="message"]');
    const sendBtn = form.querySelector('.send-btn');

    if (!messageInput.value.trim()) return;

    messageInput.disabled = true;
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    // Optimistic message (temporary node)
    const tmpId = 'tmp-' + Date.now();
    const tmpCreatedAt = new Date().toISOString();
    addMessageToUI({
        id: tmpId,
        content: formData.get('message'),
        senderId: currentUserId,
        created_at: tmpCreatedAt,
        firstName: '',
        avatar: ''
    }, { isOptimistic: true });

    try {
        const response = await fetch('/sendMessage', { method: 'POST', body: formData });
        if (!response.ok) throw new Error('Failed to send message');
        // Server က နောက်တစ်ချက်သတ်မှတ်ထားတဲ့ polling ကနေ id ပါလာပြီဆိုရင် reconcile လုပ်ပေးမယ်
        messageInput.value = '';
        // အောက်က scroll သာ current user မြောက်သွားအောင် ပေးထားတယ်
        const area = document.getElementById('messagesArea');
        if (area) {
            scrollToBottom(area);
            // <<< NEW: စာပို့ပြီးနောက်လည်း visible received မက်ဆေ့များကို mark read >>>
            markMessagesAsRead();
        }
    } catch (err) {
        console.error('Error sending message:', err);
        showToast('Failed to send message', 'error');
        // 실패시 temp ကို remove လုပ်ပေး
        const el = document.getElementById(tmpId);
        if (el) el.remove();
    } finally {
        messageInput.disabled = false;
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        messageInput.focus();
    }
}

// ---- Render message (with dedupe) ----
function addMessageToUI(message, opts = {}) {
    const { isOptimistic = false } = opts;
    const messagesArea = document.getElementById('messagesArea');
    if (!messagesArea) return;

    // If server provided numeric id and element already exists, skip (dedupe)
    if (message.id && typeof message.id === 'number') {
        const exist = document.getElementById(`msg-${message.id}`);
        if (exist) return;
    }

    const isMine = message.senderId == currentUserId;

    // Try to reconcile optimistic temp nodes when we receive the real server message
    if (!isOptimistic && isMine) {
        const tempNodes = messagesArea.querySelectorAll('.message.sent[data-temp="1"]');
        const incomingContent = (message.content || '').trim();
        for (const node of tempNodes) {
            const bubble = node.querySelector('.message-bubble');
            const txt = bubble ? bubble.textContent.trim() : '';
            if (txt === incomingContent) {
                // upgrade temp -> real
                if (typeof message.id === 'number') {
                    node.id = `msg-${message.id}`;
                } else {
                    // ensure it has a stable id even if server didn't return numeric id
                    node.id = `msg-srv-${Date.now()}`;
                }
                node.removeAttribute('data-temp');
                // update time
                const tEl = node.querySelector('.message-time');
                if (tEl) {
                    const time = new Date(message.created_at);
                    tEl.textContent = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                }
                // update lastMessageId
                if (typeof message.id === 'number') {
                    lastMessageId = Math.max(lastMessageId, message.id);
                }
                return; // done reconciling
            }
        }
    }

    // Build DOM node (new message)
    const wrap = document.createElement('div');

    // set id
    if (isOptimistic) {
        wrap.id = String(message.id); // tmp-xxx
        wrap.setAttribute('data-temp', '1');
        // store content for later reconcile if needed
        wrap.setAttribute('data-content', (message.content || '').trim());
    } else if (typeof message.id === 'number') {
        wrap.id = `msg-${message.id}`;
        lastMessageId = Math.max(lastMessageId, message.id);
    } else {
        // fallback stable id
        wrap.id = `msg-srv-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
    }

    wrap.className = `message ${isMine ? 'sent' : 'received'}`;

    const time = new Date(message.created_at || Date.now());
    const timeString = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    // status html for sent messages (only numeric ids can be marked/read)
    let statusHtml = '';
    if (isMine) {
        const midAttr = (typeof message.id === 'number') ? message.id : (isOptimistic ? '' : '');
        const iconHtml = (typeof message.is_read !== 'undefined' && message.is_read) ? '<i class="fas fa-check-circle read"></i>' : '<i class="fas fa-check-circle"></i>';
        statusHtml = midAttr ? `<span class="message-status" data-message-id="${midAttr}">${iconHtml}</span>` : `<span class="message-status">${iconHtml}</span>`;
    }

    wrap.innerHTML = `
        ${!isMine ? `
            <img src="${message.avatar || 'images/profile.jpg'}"
                 alt="${(message.firstName || 'User')}"
                 class="message-avatar">` : ''}
        <div class="message-content">
            <div class="message-bubble">${escapeHtml(message.content || '')}</div>
            <div class="message-time"><span>${timeString}</span>${statusHtml}</div>
        </div>
    `;
    const wasAtBottom = isAtBottom(messagesArea);
    messagesArea.appendChild(wrap);

    // if server sent is_read flag for this message, update DOM
    if (typeof message.is_read !== 'undefined' && typeof message.id === 'number') {
        updateMessageReadInDOM(message.id, !!message.is_read);
    }

    // Smart auto-scroll:
    if (wasAtBottom || isMine) {
        scrollToBottom(messagesArea);
        hasUserManuallyScrolledUp = false;
    }
}

// update message status icon in DOM
function updateMessageReadInDOM(messageId, isRead) {
    if (!messageId) return;
    const statusEl = document.querySelector(`.message-status[data-message-id="${messageId}"]`);
    if (!statusEl) return;
    const icon = statusEl.querySelector('i');
    if (!icon) return;
    if (isRead) {
        icon.classList.add('read');
    } else {
        icon.classList.remove('read');
    }
}

// mark visible received messages as read on server
async function markMessagesAsRead() {
    const area = document.getElementById('messagesArea');
    if (!area || !chatId) return;

    // collect received messages that are not yet marked read and have numeric ids
    const toMark = [];
    area.querySelectorAll('.message.received').forEach(msgEl => {
        const statusEl = msgEl.querySelector('.message-status');
        if (!statusEl) return;
        const mid = statusEl.getAttribute('data-message-id');
        if (!mid) return;
        // skip temporary ids
        if (!/^\d+$/.test(mid)) return;
        const icon = statusEl.querySelector('i');
        if (icon && !icon.classList.contains('read')) {
            toMark.push(parseInt(mid, 10));
        }
    });

    if (toMark.length === 0) return;

    try {
        const resp = await fetch('/api/messages/mark-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatId: chatId, messageIds: toMark })
        });
        if (resp.ok) {
            // update UI immediately
            toMark.forEach(id => updateMessageReadInDOM(id, true));
        } else {
            console.warn('mark-read failed', resp.status);
        }
    } catch (err) {
        console.error('markMessagesAsRead error', err);
    }
}

// ensure scroll event triggers marking as read when user reaches bottom
(function attachAutoMarkOnScroll() {
    const area = document.getElementById('messagesArea');
    if (!area) return;
    area.addEventListener('scroll', () => {
        if (isAtBottom(area)) {
            // small debounce
            clearTimeout(area._markReadTimer);
            area._markReadTimer = setTimeout(markMessagesAsRead, 250);
        }
    });
})();

// ---- Polling (sinceId + dedupe) ----
function startMessagePolling() {
    pollingErrorCount = 0;
    if (pollingInterval) clearInterval(pollingInterval);

    // Ensure lastMessageId is correct at start
    lastMessageId = Math.max(lastMessageId || 0, getLastMessageIdFromDOM() || 0);

    pollingInterval = setInterval(async () => {
        try {
            const since = lastMessageId || 0;
            const resp = await fetch(`/api/messages/latest?chatId=${chatId}&sinceId=${since}`);
            if (!resp.ok) {
                if (resp.status === 404) {
                    clearInterval(pollingInterval);
                    showToast('Chat not found. Message updates stopped.', 'error');
                    return;
                }
                pollingErrorCount++;
                if (pollingErrorCount >= MAX_POLLING_ERRORS) {
                    clearInterval(pollingInterval);
                    showToast('Message updates stopped due to repeated errors.', 'error');
                }
                return;
            }
            pollingErrorCount = 0;
            const data = await resp.json();

            if (data.messages && data.messages.length > 0) {
                const area = document.getElementById('messagesArea');
                const atBottomBefore = area ? isAtBottom(area) : true;

                // Process messages in order and skip ones that already exist
                for (const msg of data.messages) {
                    if (typeof msg.id === 'number' && document.getElementById(`msg-${msg.id}`)) {
                        continue; // already present
                    }
                    addMessageToUI(msg);
                    if (typeof msg.id === 'number') {
                        lastMessageId = Math.max(lastMessageId, msg.id);
                    }
                }

                if (area && (atBottomBefore || !hasUserManuallyScrolledUp)) {
                    scrollToBottom(area);
                    // user is viewing messages -> mark received ones as read
                    markMessagesAsRead();
                }
            }
        } catch (e) {
            pollingErrorCount++;
            console.error('Error polling messages:', e);
            if (pollingErrorCount >= MAX_POLLING_ERRORS) {
                clearInterval(pollingInterval);
                showToast('Message updates stopped due to repeated errors.', 'error');
            }
        }
    }, 1000);
}

// ---- Other utilities from your original file ----
function startChat(userId) {
    window.location.href = `/message?start_chat=1&user_id=${userId}`;
}

// (Keep your toast style injector as-is)

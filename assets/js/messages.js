// Messages functionality (DEDUP + SMART AUTOSCROLL)
document.addEventListener('DOMContentLoaded', function () {
    initializeMessages();
});

let pollingInterval;
let pollingErrorCount = 0;
const MAX_POLLING_ERRORS = 5;
let lastMessageId = 0;          // <-- API ကို sinceId နဲ့ခေါ်ဖို့
let initialScrollDone = false;  // <-- first load မှာပဲ bottom ဆွဲချ (user ကို မလှုပ်ရှားစေချင်)
let hasUserManuallyScrolledUp = false; // <-- user ကိုယ်တိုင် အပေါ်စောင်းသွားလား ချိတ်မိထားမယ်

function initializeMessages() {
    const messagesArea = document.getElementById('messagesArea');
    if (messagesArea) {
        // DOM ထဲက နောက်ဆုံး msg id ကို ခေါ်ယူပြီး lastMessageId အဖြစ်သတ်မှတ်
        lastMessageId = getLastMessageIdFromDOM() || 0;

        // First load မှာ bottom ဆွဲချ (messages ရှိရင်ပဲ)
        if (!initialScrollDone) {
            scrollToBottom(messagesArea);
            initialScrollDone = true;
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

    // modal buttons...
    const newChatBtn = document.getElementById('newChatBtn');
    const startChatBtn = document.getElementById('startChatBtn');
    const newChatModal = document.getElementById('newChatModal');
    const closeModal = document.getElementById('closeModal');

    if (newChatBtn) newChatBtn.addEventListener('click', () => showModal(newChatModal));
    if (startChatBtn) startChatBtn.addEventListener('click', () => showModal(newChatModal));
    if (closeModal) closeModal.addEventListener('click', () => hideModal(newChatModal));
    if (newChatModal) {
        newChatModal.addEventListener('click', (e) => { if (e.target === newChatModal) hideModal(newChatModal); });
    }

    // chat search
    const chatSearch = document.getElementById('chatSearch');
    if (chatSearch) chatSearch.addEventListener('input', handleChatSearch);

    // user search (modal)
    const userSearch = document.getElementById('userSearch');
    if (userSearch) userSearch.addEventListener('input', handleUserSearch);

    // Enter => submit
    const messageInput = document.getElementById('messageInput');
    if (messageInput && messageForm) {
        messageInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                messageForm.dispatchEvent(new Event('submit'));
            }
        });
        messageInput.focus();
    }

    // Polling on
    if (typeof chatId !== 'undefined' && chatId) {
        startMessagePolling();
    }
}

// ---- Helpers ----
function getLastMessageIdFromDOM() {
    const messagesArea = document.getElementById('messagesArea');
    if (!messagesArea) return 0;
    const last = messagesArea.lastElementChild;
    if (!last) return 0;
    // id="msg-123" ထပ်ပေါ်နေစေတာကို ထိန်းချုပ်သုံးမယ်
    const idAttr = last.getAttribute('id'); // e.g., "msg-123" or "tmp-169273..."
    if (!idAttr) return 0;
    if (idAttr.startsWith('msg-')) {
        const n = parseInt(idAttr.replace('msg-', ''), 10);
        return Number.isNaN(n) ? 0 : n;
    }
    return 0;
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
        if (area) scrollToBottom(area);
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

    // Dedupe by message.id (server-side id only)
    if (message.id && typeof message.id === 'number') {
        const exist = document.getElementById(`msg-${message.id}`);
        if (exist) return;
    }

    // Reconcile: if same content from current user & a temp node exists, upgrade it to real id
    if (!isOptimistic && message.senderId == currentUserId) {
        const tempNodes = messagesArea.querySelectorAll('.message.sent[data-temp="1"]');
        for (const node of tempNodes) {
            const txt = node.querySelector('.message-bubble')?.textContent?.trim() || '';
            const want = (message.content || '').trim();
            if (txt === want) {
                // upgrade temp -> real
                node.id = `msg-${message.id}`;
                node.removeAttribute('data-temp');
                // update time
                const tEl = node.querySelector('.message-time');
                if (tEl) {
                    const time = new Date(message.created_at);
                    tEl.textContent = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                }
                // lastMessageId update
                if (typeof message.id === 'number') {
                    lastMessageId = Math.max(lastMessageId, message.id);
                }
                return; // finished
            }
        }
    }

    // Build DOM
    const wrap = document.createElement('div');
    const isMine = message.senderId == currentUserId;

    // set id
    if (isOptimistic) {
        wrap.id = String(message.id); // tmp-xxx
        wrap.setAttribute('data-temp', '1');
    } else if (typeof message.id === 'number') {
        wrap.id = `msg-${message.id}`;
        lastMessageId = Math.max(lastMessageId, message.id);
    }

    wrap.className = `message ${isMine ? 'sent' : 'received'}`;

    const time = new Date(message.created_at);
    const timeString = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    wrap.innerHTML = `
        ${!isMine ? `
            <img src="${message.avatar || 'images/profile.jpg'}"
                 alt="${(message.firstName || 'User')}"
                 class="message-avatar">` : ''}
        <div class="message-content">
            <div class="message-bubble">${escapeHtml(message.content || '')}</div>
            <div class="message-time">${timeString}</div>
        </div>
    `;
    const wasAtBottom = isAtBottom(messagesArea);
    messagesArea.appendChild(wrap);

    // Smart auto-scroll:
    //  - user က အောက်မှာနေလျှင် scroll
    //  - current user ပို့တာလည်း scroll
    if (wasAtBottom || isMine) {
        scrollToBottom(messagesArea);
        hasUserManuallyScrolledUp = false;
    }
}

// ---- Polling (sinceId + dedupe) ----
function startMessagePolling() {
    pollingErrorCount = 0;
    if (pollingInterval) clearInterval(pollingInterval);

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

                data.messages.forEach(msg => addMessageToUI(msg));

                // user မကျော်တက်စေနဲ့ — အောက်မှာရှိမှ scroll
                if (area && (atBottomBefore || !hasUserManuallyScrolledUp)) {
                    scrollToBottom(area);
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
    }, 3000);
}

// ---- Other utilities from your original file ----
function startChat(userId) {
    window.location.href = `/message?start_chat=1&user_id=${userId}`;
}

// (Keep your toast style injector as-is)

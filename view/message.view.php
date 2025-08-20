<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Messages - SoulBridge</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="/assets/css/navigation.css" />
    <link rel="stylesheet" href="/assets/css/messages.css" />
    <script src="/assets/js/messages.js" defer></script>
</head>
<body>
    <?php
    $search_term = isset($_GET['search']) ? trim($_GET['search']) : '';
    require 'view/nav.view.php';
    ?>
    
    <div class="messages-main">
        <div class="messages-container">
            <!-- Chat List Sidebar -->
            <div class="chat-sidebar <?php echo isset($_GET['chat_id']) ? 'hidden-mobile' : ''; ?>">
                <div class="chat-header">
                    <h2>Messages</h2>
                    <button class="new-chat-btn" id="newChatBtn">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
                
                <div class="chat-search">
                    <div class="search-wrapper">
                        <i class="fas fa-search"></i>
                        <input type="text" placeholder="Search conversations..." id="chatSearch">
                    </div>
                </div>
                
                <div class="chat-list" id="chatList">
                    <?php foreach ($users as $user): ?>
                        <div class="chat-item <?php echo isset($_GET['chat_id']) && isset($chat_partner) && $chat_partner['id'] == $user['id'] ? 'active' : ''; ?>" 
                             onclick="window.location='message?start_chat=1&user_id=<?= $user['id'] ?>'">
                            <div class="chat-avatar">
                                <img src="<?= htmlspecialchars($user['avatar'] ?? 'images/profile.jpg') ?>" 
                                     alt="<?= htmlspecialchars($user['firstName'] . ' ' . $user['lastName']) ?>">
                                <div class="online-indicator"></div>
                            </div>
                            <div class="chat-info">
                                <div class="chat-name">
                                    <?= htmlspecialchars($user['firstName'] . ' ' . $user['lastName']) ?>
                                </div>
                                <div class="chat-preview">
                                    <?php if (!empty($user['last_message'])): ?>
                                        <span class="last-message"><?= htmlspecialchars(substr($user['last_message'], 0, 50)) ?><?= strlen($user['last_message']) > 50 ? '...' : '' ?></span>
                                    <?php else: ?>
                                        <span class="no-messages">Start a conversation</span>
                                    <?php endif; ?>
                                </div>
                            </div>
                            <div class="chat-meta">
                                <?php if (!empty($user['last_message_time'])): ?>
                                    <div class="chat-time">
                                        <?= date('H:i', strtotime($user['last_message_time'])) ?>
                                    </div>
                                <?php endif; ?>
                                <?php if (!empty($user['unread_count']) && $user['unread_count'] > 0): ?>
                                    <div class="unread-badge">
                                        <?= $user['unread_count'] ?>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
            
            <!-- Chat Area -->
            <div class="chat-area <?php echo !isset($_GET['chat_id']) ? 'hidden-mobile' : ''; ?>">
                <?php if (isset($_GET['chat_id'])): ?>
                    <!-- Chat Header -->
                    <div class="chat-area-header">
                        <button class="back-btn" onclick="window.location='message'">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <div class="chat-partner-info">
                            <img src="<?= htmlspecialchars($chat_partner['avatar'] ?? 'images/profile.jpg') ?>" 
                                 alt="<?= htmlspecialchars($chat_partner['firstName'] . ' ' . $chat_partner['lastName']) ?>" 
                                 class="partner-avatar">
                            <div class="partner-details">
                                <h3><?= htmlspecialchars($chat_partner['firstName'] . ' ' . $chat_partner['lastName']) ?></h3>
                                <span class="partner-status">Active now</span>
                            </div>
                        </div>
                        <div class="chat-actions">
                            <button class="action-btn">
                                <i class=""></i>
                            </button>
                            <button class="action-btn">
                                <i class=""></i>
                            </button>
                            <button class="action-btn">
                                <i class=""></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Messages -->
                    <div class="messages-area" id="messagesArea">
                        <?php foreach ($messages as $message): ?>
                            <div class="message <?= $message['senderId'] == $current_user_id ? 'sent' : 'received' ?>">
                                <?php if ($message['senderId'] != $current_user_id): ?>
                                    <img src="<?= htmlspecialchars($message['avatar'] ?? 'images/profile.jpg') ?>" 
                                         alt="<?= htmlspecialchars($message['firstName']) ?>" 
                                         class="message-avatar">
                                <?php endif; ?>
                                <div class="message-content">
                                    <div class="message-bubble">
                                        <?= htmlspecialchars($message['content']) ?>
                                    </div>
                                    <div class="message-time">
                                        <?= date('H:i', strtotime($message['created_at'])) ?>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                    
                    <!-- Message Input -->
                    <div class="message-input-area">
                        <form id="messageForm" method="POST" action="/sendMessage">
                            <input type="hidden" name="chat_id" value="<?= $_GET['chat_id'] ?>">
                            <div class="input-wrapper">
                                <button type="button" class="attachment-btn">
                                    <i class="fas fa-plus"></i>
                                </button>
                                <input type="text" 
                                       name="message" 
                                       placeholder="Type a message..." 
                                       class="message-input" 
                                       id="messageInput"
                                       autocomplete="off"
                                       required>
                                <button type="button" class="emoji-btn">
                                    <i class="fas fa-smile"></i>
                                </button>
                                <button type="submit" class="send-btn">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </form>
                    </div>
                <?php else: ?>
                    <!-- Welcome Screen -->
                    <div class="welcome-screen">
                        <div class="welcome-content">
                            <div class="welcome-icon">
                                <i class="fas fa-comments"></i>
                            </div>
                            <h2>Your Messages</h2>
                            <p>Send private messages to friends and family</p>
                            <button class="start-chat-btn" id="startChatBtn">
                                <i class="fas fa-edit"></i>
                                Start New Conversation
                            </button>
                        </div>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
    
    <!-- New Chat Modal -->
    <div class="modal" id="newChatModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Start New Conversation</h3>
                <button class="modal-close" id="closeModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="search-users">
                    <input type="text" placeholder="Search people..." id="userSearch">
                </div>
                <div class="users-list" id="usersList">
                    <?php foreach ($users as $user): ?>
                        <div class="user-item" onclick="startChat(<?= $user['id'] ?>)">
                            <img src="<?= htmlspecialchars($user['avatar'] ?? 'images/profile.jpg') ?>" 
                                 alt="<?= htmlspecialchars($user['firstName'] . ' ' . $user['lastName']) ?>">
                            <span><?= htmlspecialchars($user['firstName'] . ' ' . $user['lastName']) ?></span>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        const currentUserId = <?= $current_user_id ?>;
        const chatId = <?= isset($_GET['chat_id']) ? $_GET['chat_id'] : 'null' ?>;
    </script>
</body>
</html>
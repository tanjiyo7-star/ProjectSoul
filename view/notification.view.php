
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notifications - SoulBridge</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="/assets/css/navigation.css" />
    <link rel="stylesheet" href="/assets/css/notifications.css" />
    <script src="/assets/js/notifications.js" defer></script>
</head>
<body>
    <?php include 'view/nav.view.php'; ?>
    
    <main class="main-container">
        <div class="container">
            <div class="notifications-card">
                <header class="card-header">
                    <div class="header-content">
                        <div class="header-text">
                            <h1>Notifications</h1>
                            <p>Stay updated with your latest activities</p>
                        </div>
                        <div class="header-actions">
                            <button class="action-btn" onclick="markAllAsRead()" title="Mark all as read">
                                <i class="fas fa-check-double"></i>
                            </button>
                            <button class="action-btn" onclick="clearAllNotifications()" title="Clear all">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </header>

                <div class="card-content">
                    <!-- All Notifications Only -->
                    <div class="notification-content">
                        <div class="tab-content active" id="all-tab">
                            <?php if (empty($notifications)): ?>
                                <div class="empty-state">
                                    <div class="empty-icon">
                                        <i class="fas fa-bell-slash"></i>
                                    </div>
                                    <h3>No notifications yet</h3>
                                    <p>When you get notifications, they'll show up here</p>
                                </div>
                            <?php else: ?>
                                <div class="notifications-list" id="notificationsList">
                                    <?php 
                                    $filteredNotifications = array_filter($notifications, function($n) {
                                        return strpos($n['message'], 'system') === false;
                                    });
                                    ?>
                                    <?php foreach ($filteredNotifications as $notification): ?>
                                        <div class="notification-item <?= $notification['status'] === 'unread' ? 'unread' : '' ?>" 
                                             data-id="<?= $notification['id'] ?>"
                                             data-type="<?= getNotificationType($notification['message']) ?>">
                                            <div class="notification-avatar">
                                                <img src="<?= htmlspecialchars($notification['avatar'] ?? 'images/profile.jpg') ?>" 
                                                     alt="Profile"
                                                     onerror="this.src='images/profile.jpg'">
                                                <?php if ($notification['status'] === 'unread'): ?>
                                                    <div class="unread-indicator"></div>
                                                <?php endif; ?>
                                            </div>
                                            
                                            <div class="notification-content">
                                                <div class="notification-text">
                                                    <strong><?= htmlspecialchars($notification['firstName'] . ' ' . $notification['lastName']) ?></strong>
                                                    <?= htmlspecialchars($notification['message']) ?>
                                                </div>
                                                <div class="notification-meta">
                                                    <time datetime="<?= $notification['created_at'] ?>" class="notification-time">
                                                        <?= formatNotificationTime($notification['created_at']) ?>
                                                    </time>
                                                    <?php if ($notification['status'] === 'unread'): ?>
                                                        <span class="unread-badge">New</span>
                                                    <?php endif; ?>
                                                </div>
                                            </div>
                                            
                                            <div class="notification-actions">
                                                <?php if (strpos($notification['message'], 'friend request') !== false && $notification['status'] === 'unread'): ?>
                                                    <button class="action-btn accept-btn" 
                                                            onclick="handleFriendRequest('accept', <?= $notification['fromUserId'] ?>, <?= $notification['id'] ?>)"
                                                            title="Accept">
                                                        <i class="fas fa-check"></i>
                                                    </button>
                                                    <button class="action-btn decline-btn" 
                                                            onclick="handleFriendRequest('decline', <?= $notification['fromUserId'] ?>, <?= $notification['id'] ?>)"
                                                            title="Decline">
                                                        <i class="fas fa-times"></i>
                                                    </button>
                                                <?php else: ?>
                                                    <button class="action-btn view-btn" 
                                                            onclick="viewNotification(<?= $notification['id'] ?>, '<?= $notification['postId'] ? 'comments?post_id=' . $notification['postId'] : 'profile?id=' . $notification['fromUserId'] ?>')"
                                                            title="View">
                                                        <i class="fas fa-eye"></i>
                                                    </button>
                                                <?php endif; ?>
                                                <button class="action-btn delete-btn" 
                                                        onclick="deleteNotification(<?= $notification['id'] ?>)"
                                                        title="Delete">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <div id="toast-container" class="toast-container"></div>

    <script>
        window.csrfToken = '<?= $_SESSION['csrf_token'] ?>';
        window.notifications = <?= json_encode($notifications) ?>;
    </script>
</body>
</html>

<?php
function getNotificationType($message) {
    if (strpos($message, 'friend request') !== false) {
        return 'friend-request';
    } elseif (strpos($message, 'system') !== false) {
        return 'system';
    } else {
        return 'general';
    }
}

function formatNotificationTime($dateString) {
    $date = new DateTime($dateString);
    $now = new DateTime();
    $diff = $now->diff($date);
    
    if ($diff->days > 0) {
        return $diff->days . ' day' . ($diff->days > 1 ? 's' : '') . ' ago';
    } elseif ($diff->days > 0) {
        return $diff->days . 'd ago';
    } elseif ($diff->h > 0) {
        return $diff->h . 'h ago';
    } elseif ($diff->i > 0) {
        return $diff->i . 'm ago';
    } else {
        return 'Just now';
    }
}
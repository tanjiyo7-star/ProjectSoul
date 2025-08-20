<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SoulBridge - Home</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="/assets/css/navigation.css" />
    <link rel="stylesheet" href="/assets/css/home.css" />
    <link rel="stylesheet" href="/assets/css/stories.css" />
    <script src="/assets/js/home.js" defer></script>
    <script src="/assets/js/stories.js" defer></script>
    <script src="/assets/js/real-time.js" defer></script>
</head>
<body>
    <?php include 'view/nav.view.php'; ?>
    
    <main class="main-container">
        <div class="container">
            <!-- Left Sidebar -->
            <aside class="left-sidebar">
                <div class="profile-card">
                    <a href="/profile" class="profile-link">
                        <div class="profile-photo">
                            <img src="<?= htmlspecialchars($data['user']['avatar'] ?? 'images/profile.jpg') ?>" 
                                 alt="Profile Picture"
                                 onerror="this.src='images/profile.jpg'">
                        </div>
                        <div class="profile-info">
                            <h3><?= htmlspecialchars($data['user']['firstName'] . " " . $data['user']['lastName']) ?></h3>
                            <p class="text-muted">View Profile</p>
                        </div>
                    </a>
                </div>

                <nav class="sidebar-nav">
                    <a href="/home" class="nav-item active">
                        <i class="fas fa-home"></i>
                        <span>Home</span>
                    </a>
                    <a href="/notification" class="nav-item" id="notifications-link">
                        <i class="fas fa-bell"></i>
                        <span>Notifications</span>
                        <?php if($data['noti_count'] > 0): ?>
                            <span class="notification-badge" id="notification-count"><?= $data['noti_count'] ?></span>
                        <?php endif; ?>
                    </a>
                    <a href="/message" class="nav-item" id="messages-link">
                        <i class="fas fa-envelope"></i>
                        <span>Messages</span>
                        <?php if ($data['unread_count'] > 0): ?>
                            <span class="notification-badge" id="message-count"><?= $data['unread_count'] ?></span>
                        <?php endif; ?>
                    </a>
                    <a href="/search" class="nav-item">
                        <i class="fas fa-search"></i>
                        <span>Search</span>
                    </a>
                    <a href="/edit-profile" class="nav-item">
                        <i class="fas fa-edit"></i>
                        <span>Edit Profile</span>
                    </a>
                    <a href="/logout" class="nav-item logout">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </a>
                </nav>

                <button class="create-post-btn" onclick="document.getElementById('create-post-input').focus()">
                    <i class="fas fa-plus"></i>
                    Create Post
                </button>
            </aside>

            <!-- Main Content -->
            <div class="main-content">
                <!-- Stories Section -->
                <section class="stories-section">
                    <div class="stories-container">
                        <!-- Add Story Button -->
                        <div class="story add-story" onclick="document.getElementById('storyUpload').click()">
                            <div class="story-image">
                                <img src="<?= htmlspecialchars($data['user']['avatar'] ?? 'images/profile.jpg') ?>" 
                                     alt="Your Story"
                                     onerror="this.src='images/profile.jpg'">
                                <div class="add-icon">
                                    <i class="fas fa-plus"></i>
                                </div>
                            </div>
                            <p class="story-name">Your Story</p>
                        </div>
                        
                        <!-- Grouped user stories -->
                        <?php foreach($userStories as $userId => $userData): ?>
                            <div class="story"
                                 data-user-id="<?= $userId ?>"
                                 data-stories='<?= htmlspecialchars(json_encode($userData['stories']), ENT_QUOTES, 'UTF-8') ?>'
                                 data-story-username="<?= htmlspecialchars($userData['user']['firstName']) ?>"
                                 data-story-avatar="<?= htmlspecialchars($userData['user']['avatar'] ?? 'images/profile.jpg') ?>">
                                <div class="story-image">
                                    <img src="<?= htmlspecialchars($userData['user']['avatar'] ?? 'images/profile.jpg') ?>" alt="Story" onerror="this.src='images/profile.jpg'">
                                    <span class="story-count-badge"><?= count($userData['stories']) ?></span>
                                </div>
                                <p class="story-name"><?= htmlspecialchars($userData['user']['firstName']) ?></p>
                            </div>
                        <?php endforeach; ?>
                    </div>

                    <!-- Story Navigation Buttons -->
                    <button class="story-scroll-btn story-scroll-left"><i class="fas fa-chevron-left"></i></button>
                    <button class="story-scroll-btn story-scroll-right"><i class="fas fa-chevron-right"></i></button>
                </section>

                <!-- Hidden Story Upload Form -->
                <form action="/story-upload" method="POST" enctype="multipart/form-data" style="display: none;">
                    <input type="file" id="storyUpload" name="story_media" accept="image/*,video/*" onchange="this.form.submit()">
                    <input type="hidden" name="csrf_token" value="<?= $data['csrf_token'] ?>">
                </form>

                <!-- Create Post Section -->
                <section class="create-post-section">
                    <form action="/post-create" method="POST" enctype="multipart/form-data" class="create-post-form">
                        <div class="post-header">
                            <div class="profile-photo">
                                <img src="<?= htmlspecialchars($data['user']['avatar'] ?? 'images/profile.jpg') ?>" 
                                     alt="Profile Picture"
                                     onerror="this.src='images/profile.jpg'">
                            </div>
                            <input type="text" 
                                   placeholder="What's on your mind, <?= htmlspecialchars($data['user']['firstName']) ?>?" 
                                   id="create-post-input" 
                                   name="content" 
                                   class="post-input"
                                   required>
                        </div>

                        <div class="post-actions">
                            <div class="post-options">
                                <label class="privacy-toggle">
                                    <input type="checkbox" name="is_public" value="1" id="privacy-checkbox">
                                    <span class="toggle-slider"></span>
                                    <i class="fas fa-user-friends privacy-icon"></i>
                                    <span class="privacy-text">Friends</span>
                                </label>
                            </div>
                            
                            <div class="post-buttons">
                                <input type="file" name="fileUpload" id="imagefile" accept="image/*,video/*" style="display: none;" onchange="previewMedia(event)">
                                <button type="button" class="media-btn" onclick="document.getElementById('imagefile').click()">
                                    <i class="fas fa-image"></i>
                                    Media
                                </button>
                                <button type="submit" class="post-btn">
        
                                <i class="fas fa-paper-plane"></i>
                                    Post
                                </button>
                            </div>
                        </div>

                        <!-- Media Preview -->
                        <div class="media-preview" id="mediaPreview" style="display: none;">
                            <div class="preview-container">
                                <img id="previewImg" src="" alt="Preview" style="display: none;">
                                <video id="previewVideo" controls style="display: none;"></video>
                                <button type="button" class="remove-preview" onclick="removeMediaPreview()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>

                        <input type="hidden" name="csrf_token" value="<?= $data['csrf_token'] ?>">
                    </form>
                </section>

                <!-- Posts Feed -->
                <section class="posts-feed" id="posts-feed">
                    <?php if (empty($data['posts'])): ?>
                        <div class="empty-feed">
                            <div class="empty-icon">
                                <i class="fas fa-newspaper"></i>
                            </div>
                            <h3>No posts yet</h3>
                            <p>Start following friends or create your first post!</p>
                        </div>
                    <?php else: ?>
                        <?php foreach($data['posts'] as $post): ?>
                            <article class="post-card" data-post-id="<?= $post['post_id'] ?>">
                                <header class="post-header">
                                    <div class="post-author">
                                        <a href="/profile?id=<?= $post['userId'] ?>" class="author-link">
                                            <div class="profile-photo">
                                                <img src="<?= htmlspecialchars($post['profile_pic'] ?? 'images/profile.jpg') ?>" 
                                                     alt="Profile Picture"
                                                     onerror="this.src='images/profile.jpg'">
                                            </div>
                                            <div class="author-info">
                                                <h4><?= htmlspecialchars($post['username']) ?></h4>
                                                <time datetime="<?= $post['created_at'] ?>">
                                                    <?= formatTimeAgo($post['created_at']) ?>
                                                </time>
                                            </div>
                                        </a>
                                    </div>
                                    <div class="post-privacy">
                                        <i class="fas <?= $post['post_public'] ? 'fa-globe' : 'fa-user-friends' ?>"></i>
                                        <span><?= $post['post_public'] ? 'Public' : 'Friends' ?></span>
                                    </div>
                                </header>

                                <?php if (!empty($post['content'])): ?>
                                    <div class="post-content">
                                        <p><?= nl2br(htmlspecialchars($post['content'])) ?></p>
                                    </div>
                                <?php endif; ?>

                                <?php if (!empty($post['post_photo'])): ?>
                                    <div class="post-media">
                                        <?php if (preg_match('/\.(mp4|webm|ogg)$/i', $post['post_photo'])): ?>
                                            <video controls class="post-video">
                                                <source src="<?= htmlspecialchars($post['post_photo']) ?>">
                                                Your browser does not support the video tag.
                                            </video>
                                        <?php else: ?>
                                            <img src="<?= htmlspecialchars($post['post_photo']) ?>" 
                                                 alt="Post Image" 
                                                 class="post-image"
                                                 onclick="openImageModal('<?= htmlspecialchars($post['post_photo']) ?>')">
                                        <?php endif; ?>
                                    </div>
                                <?php endif; ?>

                                <footer class="post-footer">
                                    <!-- <div class="post-stats">
                                        <?php
                                        $like_count = $queryBuilder->getLikesCountForPost($post['post_id']);
                                        $comment_count = $queryBuilder->getCommentsCountForPost($post['post_id']);
                                        $liked = $queryBuilder->hasUserLikedPost($_SESSION['user_id'], $post['post_id']);
                                        ?>
                                        <span class="stat-item">
                                            <i class="fas fa-heart"></i>
                                            <span class="like-count"><?= $like_count ?></span> likes
                                        </span>
                                        <span class="stat-item">
                                            <i class="fas fa-comment"></i>
                                            <span class="comment-count"><?= $comment_count ?></span> comments
                                        </span>
                                    </div> -->

                                    <div class="post-actions">
                                        <button class="action-btn like-btn <?= $liked ? 'liked' : '' ?>" 
                                                data-post-id="<?= $post['post_id'] ?>">
                                            <i class="<?= $liked ? 'fas' : 'far' ?> fa-heart"></i>
                                            <span class="like-count"><?= $like_count ?></span>
                                        </button>
                                        <button class="action-btn comment-btn" 
                                                onclick="window.location.href='/comments?post_id=<?= $post['post_id'] ?>'">
                                            <i class="far fa-comment"></i>
                                            <span class="comment-count"><?= $comment_count ?></span>
                                        </button>
                                        <button class="action-btn share-btn"
                                                data-post-id="<?= $post['post_id'] ?>">
                                                <onclick="openShareModal(<?= $post['post_id'] ?>)">
                                            <i class="fas fa-share"></i>
                                            <span>Share</span>
                                        </button>
                                    </div>

                                    <!-- Quick Comment -->
                                    <div class="quick-comment">
                                        <div class="profile-photo">
                                            <img src="<?= htmlspecialchars($data['user']['avatar'] ?? 'images/profile.jpg') ?>" 
                                                 alt="Your Profile"
                                                 onerror="this.src='images/profile.jpg'">
                                        </div>
                                        <form class="comment-form" data-post-id="<?= $post['post_id'] ?>">
                                           <input type="text" 
                                                  placeholder="Write a comment..." 
                                                  name="comment" 
                                                  class="comment-input"
                                                  required>
                                           <button type="submit" class="comment-submit">
                                               <i class="fas fa-paper-plane"></i>
                                           </button>
                                           <input type="hidden" name="post_id" value="<?= $post['post_id'] ?>">
                                           <input type="hidden" name="csrf_token" value="<?= $data['csrf_token'] ?>">
                                        </form>
                                    </div>
                                </footer>
                            </article>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </section>

                <!-- Load More Button -->
                <div class="load-more-container">
                    <button class="load-more-btn" onclick="loadMorePosts()">
                        <i class="fas fa-plus"></i>
                        Load More Posts
                    </button>
                </div>
            </div>

            <!-- Right Sidebar -->
            <aside class="right-sidebar">
                <!-- Friend Requests -->
                <div class="sidebar-card">
                    <div class="card-header">
                        <h3>Friend Requests</h3>
                        <span class="badge"><?= count($data['friend_requests']) ?></span>
                    </div>
                    <div class="card-content">
                        <?php if (empty($data['friend_requests'])): ?>
                            <div class="empty-state">
                                <i class="fas fa-user-plus"></i>
                                <p>No pending requests</p>
                            </div>
                        <?php else: ?>
                            <?php foreach($data['friend_requests'] as $request): ?>
                                <div class="friend-request" data-user-id="<?= $request['user_id'] ?>">
                                    <div class="request-info">
                                        <div class="profile-photo">
                                            <img src="<?= htmlspecialchars($request['avatar'] ?? 'images/profile.jpg') ?>" 
                                                 alt="Profile Picture"
                                                 onerror="this.src='images/profile.jpg'">
                                        </div>
                                        <div class="request-details">
                                            <h4><?= htmlspecialchars($request['firstName'] . ' ' . $request['lastName']) ?></h4>
                                            <p class="mutual-friends">
                                                <?php $mutual = $queryBuilder->getMutualFriendsCount($_SESSION['user_id'], $request['user_id']); ?>
                                                <?= $mutual ?> mutual friend<?= $mutual != 1 ? 's' : '' ?>
                                            </p>
                                        </div>
                                    </div>
                                    <div class="request-actions">
                                        <button class="btn btn-primary accept-btn" 
                                                onclick="handleFriendRequest('accept', <?= $request['user_id'] ?>)">
                                            Accept
                                        </button>
                                        <button class="btn btn-secondary decline-btn" 
                                                onclick="handleFriendRequest('decline', <?= $request['user_id'] ?>)">
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </div>

                <!-- Suggested Friends -->
                <!-- <div class="sidebar-card">
                    <div class="card-header">
                        <h3>People You May Know</h3>
                    </div>
                    <div class="card-content">
                        <div class="empty-state">
                            <i class="fas fa-users"></i>
                            <p>No suggestions available</p>
                        </div>
                    </div>
                </div> -->
            </aside>
        </div>
    </main>

    <!-- Story Viewer Modal -->
    <!-- Story Modal will be created by JavaScript -->

    <!-- Share Modal -->
    <!-- Share Modal will be created by JavaScript -->

    <!-- Image Modal -->
    <div id="imageModal" class="image-modal" style="display: none;" onclick="closeImageModal()">
        <div class="image-container">
            <img id="modalImage" src="" alt="Full Size Image">
            <button class="close-modal" onclick="closeImageModal()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    </div>

    <!-- Toast Notifications -->
    <div id="toast-container" class="toast-container"></div>

    <script>
        // Pass PHP data to JavaScript
        window.userData = <?= json_encode($data['user']) ?>;
        window.csrfToken = '<?= $data['csrf_token'] ?>';
        window.currentUserId = <?= $_SESSION['user_id'] ?>;
        window.stories = <?= json_encode($stories ?? []) ?>;
    </script>
</body>
</html>

<?php
/**
 * Helper function to format time ago
 */
function formatTimeAgo($dateString) {
    $date = new DateTime($dateString);
    $now = new DateTime();
    $diff = $now->diff($date);
    
    if ($diff->days > 7) {
        return $date->format('M j, Y');
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
?>
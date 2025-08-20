<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><?= htmlspecialchars($user['firstName'] . ' ' . $user['lastName']) ?> - SoulBridge</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="/assets/css/navigation.css" />
    <link rel="stylesheet" href="/assets/css/profile.css" />
    <script src="/assets/js/profile.js" defer></script>
    <script src="/assets/js/home.js" defer></script>
    <script>
        const CSRF_TOKEN = "<?= $_SESSION['csrf_token'] ?>";
        const currentUserId = <?= $current_user_id ?>;
        const profileUserId = <?= $profile_user_id ?>;
    </script>
</head>
<body>

    <div class="profile-main">
        <!-- Profile Header -->
        <div class="profile-header-section">
            <div class="cover-photo-container">
                <img src="<?= htmlspecialchars($user['coverPhoto'] ?? 'images/SB.png') ?>" 
                     class="cover-photo" 
                     alt="Cover Photo"
                     onerror="this.src='images/SB.png'">
                <div class="cover-overlay"></div>
            </div>
            
            <div class="profile-info-container">
                <div class="profile-avatar-section">
                    <div class="profile-avatar-wrapper">
                        <img src="<?= htmlspecialchars($user['avatar'] ?? 'images/profile.jpg') ?>" 
                             alt="Profile Picture"
                             class="profile-avatar-large"
                             onerror="this.src='images/profile.jpg'">
                        <?php if ($profile_user_id == $current_user_id): ?>
                            <button class="edit-avatar-btn" onclick="window.location.href='/edit-profile'">
                                <i class="fas fa-camera"></i>
                            </button>
                        <?php endif; ?>
                    </div>
                </div>
                
                <div class="profile-details">
                    <h1 class="profile-name"><?= htmlspecialchars($user['firstName'] . ' ' . $user['lastName']) ?></h1>
                    <p class="profile-username">@<?= htmlspecialchars(strtolower(str_replace(' ', '', $user['firstName'] . $user['lastName']))) ?></p>
                    
                    <!-- Profile Stats -->
                    <div class="profile-stats">
                        <div class="stat-item">
                            <span class="stat-number"><?= $friends_count ?></span>
                            <span class="stat-label">Friends</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number"><?= $post_count ?></span>
                            <span class="stat-label">Posts</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number"><?= $like_count ?? 0 ?></span>
                            <span class="stat-label">Likes</span>
                        </div>
                    </div>
                    
                    <!-- Profile Bio -->
                    <?php if (!empty($user['bio']) || !empty($user['location']) || !empty($zodiacSign)): ?>
                        <div class="profile-bio">
                            <?php if (!empty($user['bio'])): ?>
                                <p><i class="fas fa-quote-left"></i> <?= htmlspecialchars($user['bio']) ?></p>
                            <?php endif; ?>
                            <?php if (!empty($user['location'])): ?>
                                <p><i class="fas fa-map-marker-alt"></i> <?= htmlspecialchars($user['location']) ?></p>
                            <?php endif; ?>
                            <?php if (!empty($zodiacSign)): ?>
                                <p><i class="fas fa-star"></i> <?= htmlspecialchars($zodiacSign) ?> (Zodiac)</p>
                            <?php endif; ?>
                        </div>
                    <?php endif; ?>
                    
                    <!-- Action Buttons -->
                    <div class="profile-actions">
                        <?php if ($profile_user_id != $current_user_id): ?>
                            <?php if ($friend_status === 'pending'): ?>
                                <?php if ($action_user_id == $current_user_id): ?>
                                    <button class="action-btn cancel-request-btn" data-user-id="<?= $profile_user_id ?>">
                                        <i class="fas fa-times"></i>
                                        Cancel Request
                                    </button>
                                <?php else: ?>
                                    <div class="button-group">
                                        <button class="action-btn accept-request-btn" data-user-id="<?= $profile_user_id ?>">
                                            <i class="fas fa-check"></i>
                                            Accept
                                        </button>
                                        <button class="action-btn decline-request-btn" data-user-id="<?= $profile_user_id ?>">
                                            <i class="fas fa-times"></i>
                                            Decline
                                        </button>
                                    </div>
                                <?php endif; ?>
                            <?php elseif ($friend_status === 'accepted'): ?>
                                <button class="action-btn message-btn" onclick="startChat(<?= $profile_user_id ?>)">
                                    <i class="fas fa-envelope"></i>
                                    Message
                                </button>
                                <button class="action-btn unfriend-btn" data-user-id="<?= $profile_user_id ?>">
                                    <i class="fas fa-user-minus"></i>
                                    Unfriend
                                </button>
                            <?php else: ?>
                                <button class="action-btn add-friend-btn" data-user-id="<?= $profile_user_id ?>">
                                    <i class="fas fa-user-plus"></i>
                                    Add Friend
                                </button>
                                <button class="action-btn message-btn" onclick="startChat(<?= $profile_user_id ?>)">
                                    <i class="fas fa-envelope"></i>
                                    Message
                                </button>
                            <?php endif; ?>
                        <?php else: ?>
                            <button class="action-btn edit-profile-btn">
                                <i class="fas fa-edit"></i>
                                Edit Profile
                            </button>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Profile Content -->
        <div class="profile-content">
            <div class="content-wrapper">
                <!-- Posts Section -->
                <div class="posts-section">
                    <div class="section-header">
                        <h2>Posts</h2>
                        <div class="post-filters">
                            <button class="filter-btn active" data-filter="all">All</button>
                            <button class="filter-btn" data-filter="photos">Photos</button>
                            <button class="filter-btn" data-filter="videos">Videos</button>
                        </div>
                    </div>
                    
                    <div class="posts-grid">
                        <?php if (empty($posts)): ?>
                            <div class="empty-posts">
                                <div class="empty-icon">
                                    <i class="fas fa-images"></i>
                                </div>
                                <h3>No posts yet</h3>
                                <p>
                                    <?php if ($profile_user_id == $current_user_id): ?>
                                        Share your first post to get started!
                                    <?php else: ?>
                                        <?= htmlspecialchars($user['firstName']) ?> hasn't shared any posts yet.
                                    <?php endif; ?>
                                </p>
                            </div>
                        <?php else: ?>
                            <?php foreach($posts as $post): ?>
                                <article class="post-card" data-post-id="<?= $post['post_id'] ?>">
                                    <div class="post-header">
                                        <div class="post-author">
                                            <img src="<?= htmlspecialchars($post['profile_pic'] ?? 'images/profile.jpg') ?>" 
                                                 alt="<?= htmlspecialchars($post['username']) ?>" 
                                                 class="author-avatar">
                                            <div class="author-info">
                                                <h4><?= htmlspecialchars($post['username']) ?></h4>
                                                <time><?= date('M j, Y g:i a', strtotime($post['created_at'])) ?></time>
                                            </div>
                                        </div>
                                        <div class="post-privacy">
                                            <i class="fas <?= $post['post_public'] ? 'fa-globe' : 'fa-user-friends' ?>"></i>
                                            <span><?= $post['post_public'] ? 'Public' : 'Friends' ?></span>
                                        </div>
                                    </div>
                                    
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
                                        <?php
                                        $like_count = $queryBuilder->getLikesCountForPost($post['post_id']);
                                        $liked = $queryBuilder->hasUserLikedPost($current_user_id, $post['post_id']);
                                        $comment_count = $queryBuilder->getCommentsCountForPost($post['post_id']);
                                        ?>
                                        <div class="post-actions">
                                            <button class="action-btn like-btn <?= $liked ? 'liked' : '' ?>" data-post-id="<?= $post['post_id'] ?>">
                                                <i class="<?= $liked ? 'fas' : 'far' ?> fa-heart"></i>
                                                <span class="like-count"><?= $like_count ?></span>
                                            </button>
                                            <button class="action-btn comment-btn" onclick="openComments(<?= $post['post_id'] ?>)">
                                                <i class="far fa-comment"></i>
                                                <span class="comment-count"><?= $comment_count ?></span>
                                            </button>
                                        <button class="action-btn share-btn"
                                                data-post-id="<?= $post['post_id'] ?>"
                                                onclick="openShareModal(<?= $post['post_id'] ?>)">
                                            <i class="fas fa-share"></i>
                                            <span>Share</span>
                                        </button>
                                        </div>
                                        <!-- Quick Comment Form -->
                                        <div class="quick-comment">
                                            <form class="comment-form" data-post-id="<?= $post['post_id'] ?>">
                                                <input type="hidden" name="post_id" value="<?= $post['post_id'] ?>">
                                                <input type="hidden" name="user_id" value="<?= $current_user_id ?>">
                                                <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                                                <div class="comment-input-wrapper">
                                                    <img src="<?= htmlspecialchars($login_user['avatar'] ?? 'images/profile.jpg') ?>" 
                                                         alt="Your avatar" 
                                                         class="comment-avatar">
                                                    <input type="text" 
                                                           name="comment" 
                                                           placeholder="Write a comment..." 
                                                           class="comment-input"
                                                           required>
                                                    <button type="submit" class="comment-submit-btn">
                                                        <i class="fas fa-paper-plane"></i>
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </footer>
                                </article>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Image Modal -->
    <div class="image-modal" id="imageModal">
        <div class="modal-backdrop" onclick="closeImageModal()"></div>
        <div class="modal-content">
            <button class="modal-close" onclick="closeImageModal()">
                <i class="fas fa-times"></i>
            </button>
            <img src="" alt="Full size image" id="modalImage">
        </div>
    </div>
    
    <!-- Toast for notifications -->
    <div id="toast" class="toast"></div>
</body>
</html>
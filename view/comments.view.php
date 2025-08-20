<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comments - SoulBridge</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="/assets/css/navigation.css" />
    <link rel="stylesheet" href="/assets/css/comments.css" />
    <script src="/assets/js/comments.js" defer></script>
</head>
<body>
    <?php include 'view/nav.view.php'; ?>
    
    <main class="main-container">
        <div class="container">
            <div class="comments-card">
                <!-- Header -->
                <header class="card-header">
                    <button class="back-btn" onclick="window.history.back()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="header-text">
                        <h1>Comments</h1>
                        <p><?= count($comments) ?> comment<?= count($comments) !== 1 ? 's' : '' ?></p>
                    </div>
                </header>

                <!-- Post Content -->
                <section class="post-section">
                    <article class="post-card">
                        <header class="post-header">
                            <div class="post-author">
                                <a href="profile?id=<?= $post['userId'] ?>" class="author-link">
                                    <div class="profile-photo">
                                        <img src="<?= htmlspecialchars($post['profile_pic'] ?? 'images/profile.jpg') ?>" 
                                             alt="Profile Picture"
                                             onerror="this.src='images/profile.jpg'">
                                    </div>
                                    <div class="author-info">
                                        <h3><?= htmlspecialchars($post['username']) ?></h3>
                                        <time datetime="<?= $post['created_at'] ?>">
                                            <?= date('M j, Y \a\t g:i A', strtotime($post['created_at'])) ?>
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
                            <div class="post-stats">
                                <span class="stat-item">
                                    <i class="fas fa-heart"></i>
                                    <span class="like-count"><?= $like_count ?></span> likes
                                </span>
                                <span class="stat-item">
                                    <i class="fas fa-comment"></i>
                                    <span class="comment-count"><?= count($comments) ?></span> comments
                                </span>
                            </div>

                            <div class="post-actions">
                                <button class="action-btn like-btn <?= $liked ? 'liked' : '' ?>" 
                                        data-post-id="<?= $post['post_id'] ?>"
                                        onclick="toggleLike(<?= $post['post_id'] ?>)">
                                    <i class="<?= $liked ? 'fas' : 'far' ?> fa-heart"></i>
                                    <span>Like</span>
                                </button>
                                <button class="action-btn comment-btn active">
                                    <i class="fas fa-comment"></i>
                                    <span>Comment</span>
                                </button>
                                <button class="action-btn share-btn">
                                    <i class="fas fa-share"></i>
                                    <span>Share</span>
                                </button>
                            </div>
                        </footer>
                    </article>
                </section>

                <!-- Comments Section -->
                <section class="comments-section">
                    <div class="comments-header">
                        <h3>Comments</h3>
                        <div class="sort-options">
                            <button class="sort-btn active" data-sort="newest">
                                <i class="fas fa-clock"></i>
                                Newest
                            </button>
                            <button class="sort-btn" data-sort="oldest">
                                <i class="fas fa-history"></i>
                                Oldest
                            </button>
                        </div>
                    </div>

                    <!-- Add Comment Form -->
                    <div class="add-comment-section">
                        <form class="comment-form">
                            <div class="comment-input-container">
                                <div class="profile-photo">
                                    <img src="<?= htmlspecialchars($user['avatar'] ?? 'images/profile.jpg') ?>" 
                                         alt="Your Profile"
                                         onerror="this.src='images/profile.jpg'">
                                </div>
                                <div class="input-wrapper">
                                    <textarea name="comment" 
                                              placeholder="Write a comment..." 
                                              class="comment-input"
                                              rows="1"
                                              required></textarea>
                                    <div class="input-actions">
                                        <button type="button" class="emoji-btn" title="Add emoji">
                                            <i class="fas fa-smile"></i>
                                        </button>
                                        <button type="submit" class="submit-btn">
                                            <i class="fas fa-paper-plane"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <input type="hidden" name="post_id" value="<?= $post['post_id'] ?>">
                            <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                        </form>
                    </div>

                    <!-- Comments List -->
                    <div class="comments-list" id="commentsList">
                        <?php if (empty($comments)): ?>
                            <div class="empty-comments">
                                <div class="empty-icon">
                                    <i class="fas fa-comment-slash"></i>
                                </div>
                                <h3>No comments yet</h3>
                                <p>Be the first to comment on this post</p>
                            </div>
                        <?php else: ?>
                            <?php foreach ($comments as $comment): ?>
                                <div class="comment-item" data-comment-id="<?= $comment['id'] ?>">
                                    <div class="comment-avatar">
                                        <a href="profile?id=<?= $comment['userId'] ?>">
                                            <img src="<?= htmlspecialchars($comment['avatar'] ?? 'images/profile.jpg') ?>" 
                                                 alt="Profile Picture"
                                                 onerror="this.src='images/profile.jpg'">
                                        </a>
                                    </div>
                                    <div class="comment-content">
                                        <div class="comment-bubble">
                                            <div class="comment-header">
                                                <a href="profile?id=<?= $comment['userId'] ?>" class="commenter-name">
                                                    <?= htmlspecialchars($comment['firstName'].' '.$comment['lastName']) ?>
                                                </a>
                                                <time class="comment-time" datetime="<?= $comment['created_at'] ?>">
                                                    <?= formatTimeAgo($comment['created_at']) ?>
                                                </time>
                                            </div>
                                            <div class="comment-text">
                                                <p><?= nl2br(htmlspecialchars($comment['content'])) ?></p>
                                            </div>
                                        </div>
                                        <div class="comment-actions">
                                            <button class="comment-action-btn like-comment-btn" 
                                                    data-comment-id="<?= $comment['id'] ?>">
                                                <i class="far fa-heart"></i>
                                                <span>Like</span>
                                            </button>
                                            <button class="comment-action-btn reply-btn" 
                                                    data-comment-id="<?= $comment['id'] ?>">
                                                <i class="fas fa-reply"></i>
                                                <span>Reply</span>
                                            </button>
                                            <?php if ($comment['userId'] == $_SESSION['user_id']): ?>
                                                <button class="comment-action-btn delete-btn" 
                                                        data-comment-id="<?= $comment['id'] ?>"
                                                        onclick="deleteComment(<?= $comment['id'] ?>)">
                                                    <i class="fas fa-trash"></i>
                                                    <span>Delete</span>
                                                </button>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </section>
            </div>
        </div>
    </main>

    <!-- Image Modal -->
    <div id="imageModal" class="image-modal" style="display: none;" onclick="closeImageModal()">
        <div class="image-container">
            <img id="modalImage" src="" alt="Full Size Image">
            <button class="close-modal" onclick="closeImageModal()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    </div>

    <!-- Toast Container -->
    <div id="toast-container" class="toast-container"></div>

    <script>
        // Pass PHP data to JavaScript
        window.postId = <?= $post['post_id'] ?>;
        window.currentUserId = <?= $_SESSION['user_id'] ?>;
        window.csrfToken = '<?= $_SESSION['csrf_token'] ?>';
    </script>
</body>
</html>

<?php
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
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Search - SoulBridge</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="/assets/css/navigation.css" />
    <link rel="stylesheet" href="/assets/css/search.css" />
    <script src="/assets/js/search.js" defer></script>
</head>
<body style="margin-top:5%">
    <?php
    $search_term = isset($_GET['search']) ? trim($_GET['search']) : '';
    require_once "view/nav.view.php";
    ?>
    
    <!-- Main Content -->
    <div class="search-main">
        <div class="search-container">
            <div class="search-header">
                <h1 class="search-title">
                    <?php if ($search_term): ?>
                        Search results for "<span class="search-query"><?= htmlspecialchars($search_term) ?></span>"
                    <?php else: ?>
                        Discover People
                    <?php endif; ?>
                </h1>
                <p class="search-subtitle">
                    <?= count($users) ?> <?= count($users) === 1 ? 'person' : 'people' ?> found
                </p>
            </div>

            <?php if (count($users) > 0): ?>
                <div class="search-results">
                    <?php foreach ($users as $user): ?>
                        <div class="user-card" data-user-id="<?= $user['id'] ?>">
                            <div class="user-avatar-container">
                                <img src="<?= htmlspecialchars($user['avatar'] ?? 'images/profile.jpg') ?>" 
                                     alt="<?= htmlspecialchars(($user['firstName'] ?? '') . ' ' . ($user['lastName'] ?? '')) ?>" 
                                     class="user-avatar"
                                     onerror="this.src='images/profile.jpg'">
                            </div>
                            
                            <div class="user-info">
                                <h3 class="user-name">
                                    <?= htmlspecialchars(($user['firstName'] ?? '') . ' ' . ($user['lastName'] ?? '')) ?>
                                    <?php if (($user['id'] ?? null) == $_SESSION['user_id']): ?>
                                        <span class="user-badge">You</span>
                                    <?php endif; ?>
                                </h3>
                                <p class="user-username">@<?= htmlspecialchars(strtolower(str_replace(' ', '', ($user['firstName'] ?? '') . ($user['lastName'] ?? '')))) ?></p>
                            </div>
                            
                            <div class="user-actions">
                                <?php if (($user['id'] ?? null) != $_SESSION['user_id']): ?>
                                    <button class="action-btn message-btn" onclick="startChat(<?= $user['id'] ?>)">
                                        <i class="fas fa-envelope"></i>
                                        <span>Message</span>
                                    </button>
                                    <button class="action-btn friend-btn" onclick="sendFriendRequest(<?= $user['id'] ?>)">
                                        <i class="fas fa-user-plus"></i>
                                        <span>Add Friend</span>
                                    </button>
                                <?php endif; ?>
                                <a href="profile?id=<?= $user['id']?>" class="action-btn view-btn">
                                    <i class="fas fa-eye"></i>
                                    <span>View Profile</span>
                                </a>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php else: ?>
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3 class="empty-title">No results found</h3>
                    <p class="empty-description">
                        <?php if ($search_term): ?>
                            We couldn't find anyone matching "<?= htmlspecialchars($search_term) ?>". Try searching with different keywords.
                        <?php else: ?>
                            Start typing to search for people on SoulBridge.
                        <?php endif; ?>
                    </p>
                    <div class="search-suggestions">
                        <h4>Try searching for:</h4>
                        <div class="suggestion-tags">
                            <span class="suggestion-tag" onclick="searchFor('john')">John</span>
                            <span class="suggestion-tag" onclick="searchFor('sarah')">Sarah</span>
                            <span class="suggestion-tag" onclick="searchFor('mike')">Mike</span>
                            <span class="suggestion-tag" onclick="searchFor('anna')">Anna</span>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <!-- Success/Error Messages -->
    <div id="messageToast" class="toast" style="display: none;"></div>

    <script>
        const CSRF_TOKEN = "<?= $_SESSION['csrf_token'] ?? '' ?>";
    </script>
</body>
</html>
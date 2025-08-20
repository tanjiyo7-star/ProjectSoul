<?php
$search_term = isset($_GET['search']) ? trim($_GET['search']) : '';
?>
<nav class="navbar">
    <div class="nav-container">
        <!-- Logo Section -->
        <div class="nav-brand">
            <a href="/home" class="brand-link">
                <img src="images/SB1.png" alt="SoulBridge" class="brand-logo">
                <span class="brand-text">SoulBridge</span>
            </a>
        </div>

        <!-- Search Bar -->
        <div class="nav-search">
            <form action="/search" method="GET" class="search-form">
                <div class="search-wrapper">
                    <i class="fas fa-search search-icon"></i>
                    <input type="search" 
                           name="search" 
                           placeholder="Search for people..." 
                           value="<?= htmlspecialchars($search_term) ?>"
                           class="search-input"
                           autocomplete="off">
                </div>
            </form>
        </div>

        <!-- Navigation Actions -->
        <div class="nav-actions">
            <!-- Desktop Navigation -->
            <div class="nav-links desktop-only">
                <a href="/home" class="nav-link <?= basename($_SERVER['REQUEST_URI']) == 'home' ? 'active' : '' ?>">
                    <i class="fas fa-home"></i>
                    <span>Feed</span>
                </a>
                <a href="/notification" class="nav-link <?= basename($_SERVER['REQUEST_URI']) == 'notification' ? 'active' : '' ?>" id="notifications-link">
                    <i class="fas fa-bell"></i>
                    <span>Notifications</span>
                    <?php if(isset($noti_count) && $noti_count > 0): ?>
                        <span class="notification-badge" id="notification-count"><?= $noti_count ?></span>
                    <?php endif; ?>
                </a>
                <a href="/message" class="nav-link <?= basename($_SERVER['REQUEST_URI']) == 'message' ? 'active' : '' ?>" id="messages-link">
                    <i class="fas fa-envelope"></i>
                    <span>Messages</span>
                    <?php if(isset($unread_count) && $unread_count > 0): ?>
                        <span class="notification-badge" id="message-count"><?= $unread_count ?></span>
                    <?php endif; ?>
                </a>
                <a href="/search" class="nav-link <?= basename($_SERVER['REQUEST_URI']) == 'search' ? 'active' : '' ?>">
                    <i class="fas fa-search"></i>
                    <span>Search</span>
                </a>
            </div>

            <!-- Profile Dropdown -->
            <div class="profile-dropdown">
                <button class="profile-btn" onclick="toggleProfileMenu()">
                    <img src="<?= htmlspecialchars($user['avatar'] ?? 'images/profile.jpg') ?>" 
                         alt="Profile" 
                         class="profile-avatar"
                         onerror="this.src='images/profile.jpg'">
                    <i class="fas fa-chevron-down dropdown-arrow"></i>
                </button>
                <div class="dropdown-menu" id="profileDropdown">
                    <a href="/profile" class="dropdown-item">
                        <i class="fas fa-user"></i>
                        <span>Profile</span>
                    </a>
                    <a href="/edit-profile" class="dropdown-item">
                        <i class="fas fa-edit"></i>
                        <span>Edit Profile</span>
                    </a>
                    <div class="dropdown-divider"></div>
                    <a href="/logout" class="dropdown-item logout">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </a>
                </div>
            </div>

            <!-- Mobile Menu Toggle -->
            <button class="mobile-menu-toggle" onclick="toggleMobileMenu()">
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
            </button>
        </div>
    </div>

    <!-- Mobile Menu -->
    <div class="mobile-menu" id="mobileMenu">
        <div class="mobile-menu-content">
            <a href="/home" class="mobile-nav-item <?= basename($_SERVER['REQUEST_URI']) == 'home' ? 'active' : '' ?>">
                <i class="fas fa-home"></i>
                <span>Feed</span>
            </a>
            <a href="/notification" class="mobile-nav-item <?= basename($_SERVER['REQUEST_URI']) == 'notification' ? 'active' : '' ?>">
                <i class="fas fa-bell"></i>
                <span>Notifications</span>
                <?php if(isset($noti_count) && $noti_count > 0): ?>
                    <span class="notification-badge"><?= $noti_count ?></span>
                <?php endif; ?>
            </a>
            <a href="/message" class="mobile-nav-item <?= basename($_SERVER['REQUEST_URI']) == 'message' ? 'active' : '' ?>">
                <i class="fas fa-envelope"></i>
                <span>Messages</span>
                <?php if(isset($unread_count) && $unread_count > 0): ?>
                    <span class="notification-badge"><?= $unread_count ?></span>
                <?php endif; ?>
            </a>
            <a href="/search" class="mobile-nav-item">
                <i class="fas fa-search"></i>
                <span>Search</span>
            </a>
            <div class="mobile-menu-divider"></div>
            <a href="/profile" class="mobile-nav-item">
                <i class="fas fa-user"></i>
                <span>Profile</span>
            </a>
            <a href="/edit-profile" class="mobile-nav-item">
                <i class="fas fa-edit"></i>
                <span>Edit Profile</span>
            </a>
            <a href="/logout" class="mobile-nav-item logout">
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
            </a>
        </div>
    </div>
</nav>

<script>
function toggleProfileMenu() {
    const dropdown = document.getElementById('profileDropdown');
    dropdown.classList.toggle('show');
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    mobileMenu.classList.toggle('show');
    toggle.classList.toggle('active');
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.profile-dropdown')) {
        document.getElementById('profileDropdown').classList.remove('show');
    }
    if (!e.target.closest('.mobile-menu-toggle') && !e.target.closest('.mobile-menu')) {
        document.getElementById('mobileMenu').classList.remove('show');
        document.querySelector('.mobile-menu-toggle').classList.remove('active');
    }
});
</script>
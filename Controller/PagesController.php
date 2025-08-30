<?php

class PagesController {
    public function index() {
        require_once 'view/index.view.php';
    }
    public function authenticate() {
        $queryBuilder = new queryBuilder();
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    if (isset($_POST['login'])) {
        $email = trim($_POST['email']);
        $password = $_POST['password'];
        $rememberMe = isset($_POST['remember_me']);

        if (empty($email) || empty($password)) {
            $error = 'Please enter both email and password.';
        } else {
            $user = $queryBuilder->login($email, $password);
            if ($user) {
                $_SESSION['userData'] = $queryBuilder->getUserData($user['id']);
                $_SESSION['user_email'] = $user['email'];
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['csrf_token'] = SessionManager::generateCSRFToken();

                if ($rememberMe) {
                    $token = bin2hex(random_bytes(32));
                    setcookie('remember_token', $token, time() + (30 * 24 * 60 * 60), '/', '', false, true);
                    $queryBuilder->saveRememberToken($user['id'], $token);
                }

                header("Location: /home");
                exit();
            } else {
                $_SESSION['error'] = 'Invalid email or password.';
                echo "<script>
                    alert('Invalid email or password.');
                    window.location.href = '/';
                </script>";
            }
        }
    }

    // REGISTER
    if (isset($_POST['signup'])) {
        $fname    = trim($_POST['user_firstname']);
        $lname    = trim($_POST['user_lastname']);
        $birthday = $_POST['selectyear'] . '-' . $_POST['selectmonth'] . '-' . $_POST['selectday'];
        $gender   = $_POST['gender'];
        $email    = trim($_POST['email']);
        $password = $_POST['password'];
        $confirm  = $_POST['confirm_password'] ?? '';

        // Basic validation
        if (empty($fname) || empty($lname) || empty($birthday) || empty($gender) || empty($email) || empty($password)) {
            $error = 'Please fill in all required fields.';
        }
        if ($password !== $confirm) {
            $error = 'Passwords do not match.';
        }

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $existing = $queryBuilder->select('users', '*', 'email = :email', ['email' => $email]);
        if ($existing && count($existing) > 0) {
            $error = 'Your email already exists.';
        } else {
            $result = $queryBuilder->insert('users', [
                'firstName' => $fname,
                'lastName'  => $lname,
                'birthdate' => $birthday,
                'gender'    => $gender,
                'email'     => $email,
                'password'  => $hashedPassword
            ]);
            if ($result) {
                $user = $queryBuilder->select('users', 'id', 'email = :email', ['email' => $email]);
                if ($user && count($user) > 0) {
                    $_SESSION['user_id'] = $user[0]['id'];
                    $_SESSION['user_email'] = $email;
                    $_SESSION['csrf_token'] = SessionManager::generateCSRFToken();
                    echo "<script>
                        alert('Welcome to SoulBridge! Your account has been created successfully.');
                        window.location.href = '/home';
                    </script>";
                } else {
                    $error = 'Error fetching user after signup.';
                }
            } else {
                $error = 'Error during signup.';
            }
        }
    }
}
    }
    public function profile() {
        if (!isset($_SESSION['user_id'])) {
            header('Location: /');
            exit();
        }
        $queryBuilder = new queryBuilder();
        $current_user_id = $_SESSION['user_id'];
        $profile_user_id = isset($_GET['id']) ? (int)$_GET['id'] : $current_user_id;

        // --- Inserted logic for zodiac and nav ---
        $search_term = isset($_GET['search']) ? trim($_GET['search']) : '';
        $login_user = $queryBuilder->getUserData($current_user_id);
        $user = $login_user; 
        require_once 'view/nav.view.php';
        $user = $queryBuilder->getUserData($profile_user_id);
        function getZodiacSign($birthdate) {
            if (!$birthdate) return '';
            $date = date('m-d', strtotime($birthdate));
            $zodiacs = [
                ['sign' => 'Capricorn ♑', 'start' => '12-22', 'end' => '01-19'],
                ['sign' => 'Aquarius ♒',  'start' => '01-20', 'end' => '02-18'],
                ['sign' => 'Pisces ♓',    'start' => '02-19', 'end' => '03-20'],
                ['sign' => 'Aries ♈',     'start' => '03-21', 'end' => '04-19'],
                ['sign' => 'Taurus ♉',    'start' => '04-20', 'end' => '05-20'],
                ['sign' => 'Gemini ♊',    'start' => '05-21', 'end' => '06-20'],
                ['sign' => 'Cancer ♋',    'start' => '06-21', 'end' => '07-22'],
                ['sign' => 'Leo ♌',       'start' => '07-23', 'end' => '08-22'],
                ['sign' => 'Virgo ♍',     'start' => '08-23', 'end' => '09-22'],
                ['sign' => 'Libra ♎',     'start' => '09-23', 'end' => '10-22'],
                ['sign' => 'Scorpio ♏',   'start' => '10-23', 'end' => '11-21'],
                ['sign' => 'Sagittarius ♐','start'=> '11-22', 'end' => '12-21'],
            ];
            foreach ($zodiacs as $zodiac) {
                if (
                    ($date >= $zodiac['start'] && $date <= '12-31') ||
                    ($date >= '01-01' && $date <= $zodiac['end'])
                ) {
                    if ($zodiac['start'] <= $zodiac['end']) {
                        if ($date >= $zodiac['start'] && $date <= $zodiac['end']) return $zodiac['sign'];
                    } else {
                        if ($date >= $zodiac['start'] || $date <= $zodiac['end']) return $zodiac['sign'];
                    }
                }
            }
            return '';
        }
        $zodiacSign = getZodiacSign($user['birthdate'] ?? null);
        // --- End inserted logic ---

        $friend_status = null;
        $action_user_id = null;
        if ($profile_user_id !== $current_user_id) {
            $friends = $queryBuilder->select('friends', '*', '(userId = :u1 AND friendId = :u2) OR (userId = :u2 AND friendId = :u1)', [
                'u1' => $current_user_id,
                'u2' => $profile_user_id
            ]);
            if ($friends) {
                $friend_status = $friends[0]['status'];
                $action_user_id = $friends[0]['actionUserId'];
            }
        }
        $posts = $queryBuilder->getProfilePosts($profile_user_id, $current_user_id);
        $friends_count = $queryBuilder->select('friends', 'COUNT(*) AS count', '(userId = :id OR friendId = :id) AND status = "accepted"', ['id' => $profile_user_id])[0]['count'];
        $post_count = $queryBuilder->select('posts', 'COUNT(*) AS post_count', 'userId = :id', ['id' => $profile_user_id])[0]['post_count'];
        foreach ($posts as $post) {
            $like_count = $queryBuilder->getLikesCountForPost($post['post_id']);
        }

        $noti_count = $queryBuilder->getUnreadNotificationsCount($current_user_id);
        $unread_count = $queryBuilder->getUnreadMessagesCount($current_user_id);

        require 'view/profile.view.php';
    }
    public function comment() {
        if (!isset($_SESSION['user_id'])) {
            header('Location: /');
            exit();
        }
        
        $queryBuilder = new queryBuilder();
        $current_user_id = $_SESSION['user_id'];
        $post_id = isset($_GET['post_id']) ? (int)$_GET['post_id'] : 0;
        
        if (!$post_id) {
            header('Location: /home');
            exit();
        }
        
        // Get post details
        $post = $queryBuilder->getPostById($post_id);
        if (!$post) {
            header('Location: /home');
            exit();
        }
        
        // Get comments for this post
        $comments = $queryBuilder->getCommentsForPost($post_id);
        
        // Get counts
        $like_count = $queryBuilder->getLikesCountForPost($post_id);
        $comment_count = $queryBuilder->getCommentsCountForPost($post_id);
        
        // Get user data for navigation
        $user = $queryBuilder->getUserData($current_user_id);
        $noti_count = $queryBuilder->getUnreadNotificationsCount($current_user_id);
        $unread_count = $queryBuilder->getUnreadMessagesCount($current_user_id);
        
        require_once 'view/comments.view.php';
    }
    public function search() {
        if (!isset($_SESSION['user_id'])) {
            header('Location: /');
            exit();
        }
        $queryBuilder = new queryBuilder();
        $search_term = isset($_GET['search']) ? trim($_GET['search']) : '';
        $current_user_id = $_SESSION['user_id'];

        $users = $queryBuilder->searchUsers($search_term, $current_user_id);
        $user = $queryBuilder->getUserData($current_user_id);
        $noti_count = $queryBuilder->getUnreadNotificationsCount($current_user_id);
        $unread_count = $queryBuilder->getUnreadMessagesCount($current_user_id);

        require 'view/search.view.php';
    }
    public function notification() {
        if (!isset($_SESSION['user_id'])) {
            header('Location: /');
            exit();
        }
        $queryBuilder = new queryBuilder();
        $user_id = $_SESSION['user_id'];

        $queryBuilder->markNotificationsRead($user_id);

        $user = $queryBuilder->getUserData($user_id);
        $notifications = $queryBuilder->getNotifications($user_id);

        $noti_count = $queryBuilder->getUnreadNotificationsCount($user_id);
        $unread_count = $queryBuilder->getUnreadMessagesCount($user_id);
        $comment_count = $queryBuilder-> getCommentsCountForPost($user_id);
        require_once 'view/notification.view.php';
    }
    public function error() {
        require_once 'view/error.view.php';
    }
    
    public function editProfile() {
        if (!isset($_SESSION['user_id'])) {
            header('Location: /');
            exit();
        }
        
        $queryBuilder = new queryBuilder();
        $user_id = $_SESSION['user_id'];
        
        // Get user data including profile information
        $user = $queryBuilder->getUserFullData($user_id);
        
        require_once 'view/edit-profile.view.php';
    }
    
    public function updateProfile() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_SESSION['user_id'])) {
            header('Location: /');
            exit();
        }
        
        header('Content-Type: application/json');
        
        try {
            // Validate CSRF token
            if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
                throw new Exception('Invalid CSRF token');
            }
            
            $queryBuilder = new queryBuilder();
            $user_id = $_SESSION['user_id'];
            
            // Validate current password
            $currentPassword = $_POST['currentPassword'] ?? '';
            if (!$queryBuilder->verifyCurrentPassword($user_id, $currentPassword)) {
                throw new Exception('Current password is incorrect');
            }
            
            // Prepare data for update
            $userData = [
                'firstName' => trim($_POST['firstName'] ?? ''),
                'lastName' => trim($_POST['lastName'] ?? ''),
                'email' => trim($_POST['email'] ?? ''),
                'birthdate' => $_POST['birthdate'] ?? null,
                'gender' => $_POST['gender'] ?? null
            ];
            
            $profileData = [
                'bio' => trim($_POST['bio'] ?? ''),
                'location' => trim($_POST['location'] ?? '')
            ];
            
            // Validate required fields
            if (empty($userData['firstName']) || empty($userData['lastName']) || empty($userData['email'])) {
                throw new Exception('First name, last name, and email are required');
            }
            
            // Validate email format
            if (!filter_var($userData['email'], FILTER_VALIDATE_EMAIL)) {
                throw new Exception('Invalid email format');
            }
            
            // Check if email is already taken by another user
            if ($queryBuilder->isEmailTaken($userData['email'], $user_id)) {
                throw new Exception('Email is already taken by another user');
            }
            
            // Handle password change if requested
            if (!empty($_POST['newPassword'])) {
                $newPassword = $_POST['newPassword'];
                $confirmPassword = $_POST['confirmPassword'] ?? '';
                
                if ($newPassword !== $confirmPassword) {
                    throw new Exception('New passwords do not match');
                }
                
                if (strlen($newPassword) < 8) {
                    throw new Exception('New password must be at least 8 characters long');
                }
                
                $userData['password'] = password_hash($newPassword, PASSWORD_DEFAULT);
            }
            
            // Update user data
            $result = $queryBuilder->updateUserProfile($user_id, $userData, $profileData);
            
            if ($result) {
                echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
            } else {
                throw new Exception('Failed to update profile');
            }
            
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit();
    }
    
    public function uploadAvatar() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_SESSION['user_id'])) {
            header('Location: /');
            exit();
        }
        
        header('Content-Type: application/json');
        
        try {
            // Validate CSRF token
            if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
                throw new Exception('Invalid CSRF token');
            }
            
            if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
                throw new Exception('No file uploaded or upload error');
            }
            
            $file = $_FILES['avatar'];
            
            // Validate file type
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!in_array($file['type'], $allowedTypes)) {
                throw new Exception('Invalid file type. Only JPEG, PNG, and GIF are allowed');
            }
            
            // Validate file size (max 5MB)
            if ($file['size'] > 5 * 1024 * 1024) {
                throw new Exception('File size too large. Maximum 5MB allowed');
            }
            
            // Create upload directory if it doesn't exist
            $uploadDir = 'uploads/avatars/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            
            // Generate unique filename
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = 'avatar_' . $_SESSION['user_id'] . '_' . time() . '.' . $extension;
            $filepath = $uploadDir . $filename;
            
            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $filepath)) {
                throw new Exception('Failed to save uploaded file');
            }
            
            // Update database
            $queryBuilder = new queryBuilder();
            $result = $queryBuilder->updateUserAvatar($_SESSION['user_id'], $filepath);
            
            if ($result) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Avatar updated successfully',
                    'avatar_url' => $filepath
                ]);
            } else {
                throw new Exception('Failed to update avatar in database');
            }
            
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit();
    }
    
    public function comments() {
        if (!isset($_SESSION['user_id'])) {
            header('Location: /');
            exit();
        }
        
        $queryBuilder = new queryBuilder();
        $current_user_id = $_SESSION['user_id'];
        $post_id = isset($_GET['post_id']) ? (int)$_GET['post_id'] : 0;
        
        if ($post_id <= 0) {
            header('Location: /home');
            exit();
        }
        
        // Get post data
        $post = $queryBuilder->getPostById($post_id);
        if (!$post) {
            header('Location: /error');
            exit();
        }
        
        // Get comments for the post
        $comments = $queryBuilder->getCommentsForPost($post_id);
        
        // Get user data
        $user = $queryBuilder->getUserData($current_user_id);
        $noti_count = $queryBuilder->getUnreadNotificationsCount($current_user_id);
        $unread_count = $queryBuilder->getUnreadMessagesCount($current_user_id);
        
        // Check if user has liked the post
        $liked = $queryBuilder->hasUserLikedPost($current_user_id, $post_id);
        $like_count = $queryBuilder->getLikesCountForPost($post_id);
        
        require_once 'view/comments.view.php';
    }
    public function logout() {
        session_destroy();
        header('Location: /');
        exit(); 
    }
    
    public function home() {
        $queryBuilder = new queryBuilder();

        if (isset($_SESSION['user_id'])) {
            $user_id = $_SESSION['user_id'];

            $user = $queryBuilder->getUserData($user_id);
            if (!$user) {

                header("Location: /?message=User data not found. Please log in again.");
                exit();
            }

            $_SESSION['user_firstname'] = $user['firstName'];
            $_SESSION['user_lastname'] = $user['lastName'];

            if (empty($_SESSION['csrf_token'])) {
                $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
            }

            $posts = $queryBuilder->getPosts($user_id);

            $friend_requests = $queryBuilder->getFriendRequests($user_id);

            $chats = $queryBuilder->getChatsForUser($user_id);

            $noti_count = $queryBuilder->getUnreadNotificationsCount($user_id);

            $unread_count = $queryBuilder->getUnreadMessagesCount($user_id);

            $unread_chat_counts = $queryBuilder->getUnreadChatCounts($user_id);

            $stories = $queryBuilder->getStories();

            // Group stories by userId
            $userStories = [];
            foreach ($stories as $story) {
                $userId = $story['userId'];
                if (!isset($userStories[$userId])) {
                    $userStories[$userId] = [
                        'user' => [
                            'firstName' => $story['firstName'],
                            'avatar' => $story['avatar'],
                            'userId' => $userId
                        ],
                        'stories' => []
                    ];
                }
                $userStories[$userId]['stories'][] = [
                    'id' => $story['id'],
                    'media' => $story['media'],
                    'mediaType' => $story['mediaType']
                ];
            }

            $data = [
                'user' => $user,
                'posts' => $posts,
                'friend_requests' => $friend_requests,
                'chats' => $chats,
                'noti_count' => $noti_count,
                'unread_count' => $unread_count,
                'unread_chat_counts' => $unread_chat_counts,
                'csrf_token' => $_SESSION['csrf_token'],
                'stories' => $userStories
            ];
            require_once 'view/home.view.php';
        } else {
            header('Location: /'); 
            exit();
        }
    }
    public function postHandler() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (isset($_POST['csrf_token']) && $_POST['csrf_token'] === $_SESSION['csrf_token']) {
                $queryBuilder = new queryBuilder();
                $userId = $_SESSION['user_id'];
                $content = $_POST['content'];
                $isPublic = isset($_POST['is_public']) ? 1 : 0;

                // Handle file upload
                $filePath = null;
                if (isset($_FILES['fileUpload']) && $_FILES['fileUpload']['error'] === UPLOAD_ERR_OK) {
                    $uploadDir = 'uploads/';
                    if (!is_dir($uploadDir)) {
                        mkdir($uploadDir, 0777, true);
                    }
                    $fileTmp = $_FILES['fileUpload']['tmp_name'];
                    $fileName = time() . '_' . basename($_FILES['fileUpload']['name']);
                    $filePath = $uploadDir . $fileName;
                    move_uploaded_file($fileTmp, $filePath);
                }

                $queryBuilder->createPost($userId, $content, $filePath, $isPublic);
                header('Location: /home');
                exit();
            } else {
                header('Location: /?message=Invalid CSRF token.');
                exit();
            }
        } else {
            header('Location: /');
            exit();
        }
    }
    public function storyUpload() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_SESSION['user_id'])) {
            $userId = $_SESSION['user_id'];
            
            if (isset($_FILES['story_media']) && $_FILES['story_media']['error'] === UPLOAD_ERR_OK) {
                $fileType = $_FILES['story_media']['type'];
                $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
                $maxSize = 20 * 1024 * 1024; // 20MB for stories
                
                if (!in_array($fileType, $allowedTypes) || $_FILES['story_media']['size'] > $maxSize) {
                    header('Location: /home?error=invalid_story_file');
                    exit();
                }
                
                $uploadDir = 'uploads/stories/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                
                $fileTmp = $_FILES['story_media']['tmp_name'];
                $fileExtension = pathinfo($_FILES['story_media']['name'], PATHINFO_EXTENSION);
                $fileName = uniqid() . '_' . time() . '.' . $fileExtension;
                $filePath = $uploadDir . $fileName;
                
                if (move_uploaded_file($fileTmp, $filePath)) {
                    $queryBuilder = new queryBuilder();
                    $mediaType = strpos($fileType, 'video') !== false ? 'video' : 'image';
                    $queryBuilder->addStory($userId, $filePath, $mediaType);
                }
            }
            header('Location: /home');
            exit();
        }
        header('Location: /home');
        exit();
    }

    public function commentHandler() {
        header('Content-Type: application/json');
        
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_SESSION['user_id'])) {
            $queryBuilder = new queryBuilder();
            $userId = $_SESSION['user_id'];
            $postId = (int)$_POST['post_id'];
            $comment = trim($_POST['comment']);
            
            if (isset($_POST['csrf_token']) && $_POST['csrf_token'] === $_SESSION['csrf_token']) {
                if (!empty($comment)) {
                    $result = $queryBuilder->addComment($userId, $postId, $comment);
                    
                    if ($result) {
                        $postOwnerSql = "SELECT userId FROM posts WHERE id = :postId";
                        $stmt = $queryBuilder->pdo->prepare($postOwnerSql);
                        $stmt->execute(['postId' => $postId]);
                        $postOwner = $stmt->fetch(PDO::FETCH_ASSOC);
                        
                        if ($postOwner && $postOwner['userId'] != $userId) {
                            $queryBuilder->addNotification($userId, $postOwner['userId'], "commented on your post.", $postId);
                        }
                    }
                }
                
                // Return JSON for AJAX requests
                if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && 
                    strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
                    header('Content-Type: application/json');
                    echo json_encode(['success' => true, 'message' => 'Comment added successfully']);
                    exit;
                }   
                
                header('Location: /home');
                exit();
            } else {
                header('Location: /?message=Invalid CSRF token.');
                exit();
            }
        }
        header('Location: /home');
        exit();
    }

    public function likePost() {
        header('Content-Type: application/json');
        
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(['success' => false, 'error' => 'Not logged in']);
            exit;
        }
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(['success' => false, 'error' => 'Invalid request method']);
            exit;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        if (!isset($input['post_id'], $input['action'])) {
            echo json_encode(['success' => false, 'error' => 'Invalid input']);
            exit;
        }
        
        $userId = $_SESSION['user_id'];
        $postId = (int)$input['post_id'];
        $action = $input['action'];

        $queryBuilder = new queryBuilder();

        try {
            if ($action === 'like') {
                $result = $queryBuilder->likePost($userId, $postId);
            } elseif ($action === 'unlike') {
                $result = $queryBuilder->unlikePost($userId, $postId);
            } else {
                echo json_encode(['success' => false, 'error' => 'Invalid action']);
                exit;
            }
            
            $like_count = $queryBuilder->getLikesCountForPost($postId);
            $liked = $queryBuilder->hasUserLikedPost($userId, $postId);

            echo json_encode([
                'success' => true,
                'like_count' => $like_count,
                'liked' => $liked
            ]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'error' => 'Database error']);
        }
        exit;
    }

    public function message() {
    if (!isset($_SESSION['user_id'])) {
        header('Location: /');
        exit();
    }

    $queryBuilder = new queryBuilder();
    $current_user_id = $_SESSION['user_id'];
    $noti_count = $queryBuilder->getUnreadNotificationsCount($current_user_id);
    $unread_count = $queryBuilder->getUnreadMessagesCount($current_user_id);
    $last_message = $queryBuilder->getLastMessageForUser($current_user_id);

    $users_raw = $queryBuilder->getAllUsersWithAvatarExcept($current_user_id);
    $users = [];
    foreach ($users_raw as $user) {
        $last_message = $queryBuilder->getLastMessageWithUser($current_user_id, $user['id']);
        $unread_count = $queryBuilder->getUnreadCountWithUser($current_user_id, $user['id']);
        $users[] = [
            'id' => $user['id'],
            'firstName' => $user['firstName'],
            'lastName' => $user['lastName'],
            'avatar' => $user['avatar'],
            'last_message' => $last_message['last_message'] ?? '',
            'last_message_time' => $last_message['last_message_time'] ?? '',
            'unread_count' => $unread_count
        ];
    }
    // Sort users by last_message_time DESC (most recent first)
    usort($users, function($a, $b) {
        return strtotime($b['last_message_time']) <=> strtotime($a['last_message_time']);
    });

    $user = $queryBuilder->getUserData($current_user_id);

    // Start chat if requested
    if (isset($_GET['start_chat'])) {
        $other_user_id = (int)$_GET['user_id'];
        $chat_id = $queryBuilder->findExistingChat($current_user_id, $other_user_id);
        if (!$chat_id) {
            $chat_id = $queryBuilder->createNewChat($current_user_id, $other_user_id);
        }
        header("Location: /message?chat_id=$chat_id");
        exit();
    }

    // Get messages for chat if chat_id is set (use GET, not POST)
    $messages = [];
    if (isset($_GET['chat_id'])) {
        $chat_id = (int)$_GET['chat_id'];
        // Verify user is in chat
        $chats = $queryBuilder->getChatsForUser($current_user_id);
        $has_access = false;
        foreach ($chats as $chat) {
            if ($chat['chat_id'] == $chat_id) {
                $has_access = true;
                break;
            }
        }
        if (!$has_access) {
            die("Unauthorized access to this chat");
        }
        $messages = $queryBuilder->getMessagesForChat($chat_id);
        $chat_partner = $queryBuilder->getChatUser($chat_id, $current_user_id);
        $queryBuilder->markMessagesAsRead($chat_id, $current_user_id);
    }

    require_once 'view/message.view.php';
}
    public function sendMessage() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_SESSION['user_id'])) {
            header('Location: /');
            exit();
        }
        
        $chat_id = (int)($_POST['chat_id'] ?? 0);
        $message = trim($_POST['message'] ?? '');
        $user_id = (int)$_SESSION['user_id'];
        
        if (empty($message) || $chat_id <= 0) {
            header("Location: /message?chat_id=$chat_id&error=empty_message");
            exit();
        }
        
        $queryBuilder = new queryBuilder();
        
        // Verify user has access to this chat
        $chats = $queryBuilder->getChatsForUser($user_id);
        $has_access = false;
        
        foreach ($chats as $chat) {
            if ($chat['chat_id'] == $chat_id) {
                $has_access = true;
                break;
            }
        }
        
        if (!$has_access) {
            header('Location: /message?error=access_denied');
            exit();
        }
        
        // Send the message
        $success = $queryBuilder->sendMessage($chat_id, $user_id, $message);
        
        if ($success) {
            header("Location: /message?chat_id=$chat_id");
        } else {
            header("Location: /message?chat_id=$chat_id&error=send_failed");
        }
        exit();
    }

    public function friendRequest() {
        header('Content-Type: application/json');

        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $action = $data['action'] ?? '';
            $user_id = intval($data['user_id'] ?? 0);
            $allowed_actions = ['send', 'accept', 'decline', 'cancel', 'unfriend'];

            if (!isset($_SERVER['HTTP_X_CSRF_TOKEN']) || !hash_equals($_SESSION['csrf_token'] ?? '', $_SERVER['HTTP_X_CSRF_TOKEN'])) {
                throw new Exception('Invalid CSRF token.');
            }

            if (!in_array($action, $allowed_actions) || $user_id <= 0 || $user_id === $_SESSION['user_id']) {
                throw new Exception('Invalid request parameters.');
            }

            $current_user_id = $_SESSION['user_id'];
            $queryBuilder = new queryBuilder();

            switch ($action) {
                case 'send':
                    $result = $queryBuilder->sendFriendRequest($current_user_id, $user_id);
                    break;
                case 'accept':
                    $result = $queryBuilder->acceptFriendRequest($user_id, $current_user_id);
                    break;
                case 'decline':
                    $result = $queryBuilder->declineFriendRequest($user_id, $current_user_id);
                    break;
                case 'cancel':
                    $result = $queryBuilder->cancelFriendRequest($current_user_id, $user_id);
                    break;
                case 'unfriend':
                    $result = $queryBuilder->unfriend($current_user_id, $user_id);
                    break;
                default:
                    throw new Exception('Invalid action.');
            }

            if ($result['success']) {
                echo json_encode(['success' => true, 'message' => $result['message']]);
            } else {
                throw new Exception($result['message']);
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }
    
    // API endpoints for real-time functionality
    public function apiNotificationCounts() {
        header('Content-Type: application/json');
        
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
            echo json_encode(['error' => 'Not authenticated']);
            exit();
        }
        // Validate CSRF token
        if (!isset($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'] ?? '', $_POST['csrf_token'])) {
            http_response_code(403);
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid input data']);
            return;
        }
        
        try {
            $result = $this->queryBuilder->addComment($user_id, $post_id, $comment);
            
            if ($result) {
                // Get post owner for notification
                $post = $this->queryBuilder->getPostById($post_id);
                if ($post && $post['userId'] != $user_id) {
                    $this->queryBuilder->addNotification(
                        $user_id, 
                        $post['userId'], 
                        'commented on your post.', 
                        $post_id
                    );
                }
                
                echo json_encode([
                    'success' => true, 
                    'message' => 'Comment added successfully'
                ]);
            } else {
                throw new Exception('Failed to save comment');
            }
        } catch (Exception $e) {
            error_log('Comment error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false, 
                'error' => 'Failed to add comment'
            ]);
        }
    }
        $queryBuilder = new queryBuilder();
        $user_id = $_SESSION['user_id'];
        
        $noti_count = $queryBuilder->getUnreadNotificationsCount($user_id);
        $unread_count = $queryBuilder->getUnreadMessagesCount($user_id);
        
        echo json_encode([
            'notification_count' => $noti_count,
            'message_count' => $unread_count,
            'notifications' => $noti_count,
            'messages' => $unread_count
        ]);
        exit();
    }
    
    public function apiHeartbeat() {
        header('Content-Type: application/json');
        
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Not authenticated']);
            exit();
        }
        
        try {
            $queryBuilder = new queryBuilder();
            $sql = "UPDATE users SET last_seen = NOW() WHERE id = :userId";
            $stmt = $queryBuilder->pdo->prepare($sql);
            $stmt->execute(['userId' => $_SESSION['user_id']]);
            
            echo json_encode(['status' => 'ok', 'timestamp' => time()]);
        }    catch (Exception $e) {
            error_log("Heartbeat Error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        exit();
    }
    
    public function apiOnlineUsers() {
        header('Content-Type: application/json');
        
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Not authenticated']);
            exit();
        }
        
        try {
            $queryBuilder = new queryBuilder();
            
            $sql = "SELECT id FROM users 
                    WHERE last_seen > DATE_SUB(NOW(), INTERVAL 1 MINUTE)
                    AND id != :userId";
            
            $stmt = $queryBuilder->pdo->prepare($sql);
            $stmt->execute(['userId' => $_SESSION['user_id']]);
            
            $onlineUsers = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $onlineUsers[] = intval($row['id']);
            }
            
            echo json_encode(['onlineUsers' => $onlineUsers]);
        } catch (Exception $e) {
            error_log("onlineUsers Error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        exit();
    }

    // PagesController.php
public function apiLatestMessages() {
    header('Content-Type: application/json');

    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Not authenticated']);
        exit();
    }

    $userId = (int) $_SESSION['user_id'];
    $chatId = isset($_GET['chatId']) ? (int) $_GET['chatId'] : 0;
    $sinceId = isset($_GET['sinceId']) ? (int) $_GET['sinceId'] : 0;

    if ($chatId <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid chat ID']);
        exit();
    }

    try {
         $qb = new queryBuilder();

        // // 1) Verify user is a participant of the chat
        // $sql = "SELECT id FROM chats 
        //         WHERE id = :chatId AND (user1Id = :uid OR user2Id = :uid) LIMIT 1";
        // $stmt = $qb->pdo->prepare($sql);
        // $stmt->execute(['chatId' => $chatId, 'uid' => $userId]);
        // $chat = $stmt->fetch(PDO::FETCH_ASSOC);

        // if (!$chat) {
        //     http_response_code(404);
        //     echo json_encode(['error' => 'Chat not found']);
        //     exit();
        // }

        // 2) Fetch messages newer than sinceId (to avoid duplicates)
        $sql = "SELECT m.id, m.chatId, m.senderId, m.content, m.created_at,m.is_read,
                       u.firstName, u.lastName, p.avatar
                FROM messages m
                JOIN users u ON u.id = m.senderId
                JOIN profiles p ON u.id = p.id
                WHERE m.chatId = :chatId AND m.id > :sinceId
                ORDER BY m.id ASC
                LIMIT 100";
        $stmt = $qb->pdo->prepare($sql);
        $stmt->execute(['chatId' => $chatId, 'sinceId' => $sinceId]);

        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['messages' => $messages]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

    public function apiMessageStatus() {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Not authenticated']);
            exit();
        }

        try {
            $queryBuilder = new queryBuilder();
            $messageStatus = [];

            $sql = "SELECT id, is_read FROM messages WHERE senderId = :userId";
            $stmt = $queryBuilder->pdo->prepare($sql);
            $stmt->execute(['userId' => $_SESSION['user_id']]);

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $messageStatus[$row['id']] = $row['is_read'];
            }

            echo json_encode(['messageStatus' => $messageStatus]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }


    
    public function apiLikeCounts() {
        header('Content-Type: application/json');
        
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Not authenticated']);
            exit();
        }
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            exit();
        }
        
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $postIds = $input['post_ids'] ?? [];
            
            if (empty($postIds) || !is_array($postIds)) {
                echo json_encode(['likeCounts' => []]);
                exit();
            }
            
            $queryBuilder = new queryBuilder();
            $likeCounts = [];
            
            foreach ($postIds as $postId) {
                $postId = intval($postId);
                if ($postId > 0) {
                    $likeCounts[$postId] = $queryBuilder->getLikesCountForPost($postId);
                }
            }
            
            echo json_encode(['likeCounts' => $likeCounts]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Server error']);
        }
        exit();
    }
    
    public function apiCommentCounts() {
        header('Content-Type: application/json');
        
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(['error' => 'Not authenticated']);
            exit();
        }
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            exit();
        }
        
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $postIds = $input['post_ids'] ?? [];
            
            if (empty($postIds) || !is_array($postIds)) {
                echo json_encode(['commentCounts' => []]);
                exit();
            }
            
            $queryBuilder = new queryBuilder();
            $commentCounts = [];
            
            foreach ($postIds as $postId) {
                $postId = intval($postId);
                if ($postId > 0) {
                    $commentCounts[$postId] = $queryBuilder->getCommentsCountForPost($postId);
                }
            }
            
            echo json_encode(['commentCounts' => $commentCounts]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Server error']);
        }
        exit();
    }
    
    public function apiCommentDelete() {
        header('Content-Type: application/json');
        
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Not authenticated']);
            exit();
        }
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            exit();
        }
        
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $commentId = intval($input['comment_id'] ?? 0);
            
            if ($commentId <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid comment ID']);
                exit();
            }
            
            $queryBuilder = new queryBuilder();
            
            // Verify the comment belongs to the current user
            $sql = "SELECT userId FROM comments WHERE id = :commentId";
            $stmt = $queryBuilder->pdo->prepare($sql);
            $stmt->execute(['commentId' => $commentId]);
            $comment = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$comment) {
                http_response_code(404);
                echo json_encode(['error' => 'Comment not found']);
                exit();
            }
            
            if ($comment['userId'] != $_SESSION['user_id']) {
                http_response_code(403);
                echo json_encode(['error' => 'Not authorized to delete this comment']);
                exit();
            }
            
            // Delete the comment
            $result = $queryBuilder->deleteComment($commentId);
            
            if ($result) {
                echo json_encode(['success' => true, 'message' => 'Comment deleted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to delete comment']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Server error']);
        }
        exit();
    }
    
    public function apiCommentLike() {
        header('Content-Type: application/json');
        
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Not authenticated']);
            exit();
        }
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            exit();
        }
        
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $commentId = intval($input['comment_id'] ?? 0);
            $action = $input['action'] ?? '';
            
            if ($commentId <= 0 || !in_array($action, ['like', 'unlike'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid parameters']);
                exit();
            }
            
            // For now, just return success - you can implement comment likes later
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Server error']);
        }
        exit();
    }
    
    public function apiCommentTyping() {
        header('Content-Type: application/json');
        
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Not authenticated']);
            exit();
        }
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            exit();
        }
        
        try {
            // For now, just return success - you can implement typing indicators later
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Server error']);
        }
        exit();
    }
    
    public function apiSearch() {
        header('Content-Type: application/json');
        
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Not authenticated']);
            exit();
        }
        
        try {
            $query = trim($_GET['q'] ?? '');
            
            if (strlen($query) < 2) {
                echo json_encode(['success' => true, 'users' => []]);
                exit();
            }
            
            $queryBuilder = new queryBuilder();
            $currentUserId = $_SESSION['user_id'];
            
            $users = $queryBuilder->searchUsers($query, $currentUserId);
            
            // Add isCurrentUser flag
            foreach ($users as &$user) {
                $user['isCurrentUser'] = ($user['id'] == $currentUserId);
            }
            
            echo json_encode(['success' => true, 'users' => $users]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Server error']);
        }
        exit();
    }
    
    public function apiClearAllNotifications() {
        header('Content-Type: application/json');
        
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Not authenticated']);
            exit();
        }
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            exit();
        }
        
        try {
            $queryBuilder = new queryBuilder();
            $userId = $_SESSION['user_id'];
            
            $sql = "DELETE FROM notifications WHERE toUserId = :userId";
            $stmt = $queryBuilder->pdo->prepare($sql);
            $result = $stmt->execute(['userId' => $userId]);
            
            if ($result) {
                echo json_encode(['success' => true, 'message' => 'All notifications cleared']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to clear notifications']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Server error']);
        }
        exit();
    }
    
    public function apiMarkAllNotificationsRead() {
    header('Content-Type: application/json');
    
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Not authenticated']);
        exit();
    }
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit();
    }
    
    try {
        $queryBuilder = new queryBuilder();
        $userId = $_SESSION['user_id'];
        
        $sql = "UPDATE notifications SET status = 'read' WHERE toUserId = :userId AND status = 'unread'";
        $stmt = $queryBuilder->pdo->prepare($sql);
        $result = $stmt->execute(['userId' => $userId]);
        
        if ($result) {
            echo json_encode(['success' => true, 'message' => 'All notifications marked as read']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to mark notifications as read']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error']);
    }
    exit();
}
    public function deleteNotification() {
        header('Content-Type: application/json');
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_SESSION['user_id'])) {
            echo json_encode(['success' => false, 'error' => 'Unauthorized']);
            exit();
        }
        
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $notificationId = $input['notification_id'] ?? 0;
            
            if (!$notificationId) {
                throw new Exception('Invalid notification ID');
            }
            
            $queryBuilder = new queryBuilder();
            $result = $queryBuilder->deleteNotification($notificationId, $_SESSION['user_id']);
            
            if ($result) {
                echo json_encode(['success' => true, 'message' => 'Notification deleted']);
            } else {
                throw new Exception('Failed to delete notification');
            }
            
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        exit();
    }
    
    public function markNotificationRead() {
        header('Content-Type: application/json');
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_SESSION['user_id'])) {
            echo json_encode(['success' => false, 'error' => 'Unauthorized']);
            exit();
        }
        
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $notificationId = $input['notification_id'] ?? 0;
            
            if (!$notificationId) {
                throw new Exception('Invalid notification ID');
            }
            
            $queryBuilder = new queryBuilder();
            $result = $queryBuilder->markNotificationAsRead($notificationId, $_SESSION['user_id']);
            
            if ($result) {
                echo json_encode(['success' => true, 'message' => 'Notification marked as read']);
            } else {
                throw new Exception('Failed to mark notification as read');
            }
            
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        exit();
    }

    public function apiNewPostsCount() {
        $queryBuilder = new queryBuilder();
        $since = isset($_GET['since']) ? intval($_GET['since']) : 0;
        $count = $queryBuilder->getNewPostsCountSince($since);
        header('Content-Type: application/json');
        echo json_encode(['count' => $count]);
        exit;
    }

    public function apiMarkMessagesRead() {
        header('Content-Type: application/json');

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            exit();
        }

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Not authenticated']);
            exit();
        }

        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $chatId = isset($input['chatId']) ? (int)$input['chatId'] : 0;
            $messageIds = isset($input['messageIds']) && is_array($input['messageIds']) ? $input['messageIds'] : [];

            if ($chatId <= 0 || empty($messageIds)) {
                echo json_encode(['success' => true, 'updated' => [], 'message' => 'Nothing to mark read']);
                exit();
            }

            // sanitize ids -> keep only positive integers
            $cleanIds = [];
            foreach ($messageIds as $mid) {
                $id = (int)$mid;
                if ($id > 0) $cleanIds[] = $id;
            }
            if (empty($cleanIds)) {
                echo json_encode(['success' => true, 'updated' => []]);
                exit();
            }

            $qb = new queryBuilder();
            $userId = (int)$_SESSION['user_id'];

            // Find which message ids are valid to mark as read (belong to this chat, not sent by current user, currently unread)
            $placeholders = implode(',', array_fill(0, count($cleanIds), '?'));
            $selectSql = "SELECT id FROM messages 
                      WHERE chatId = ? 
                        AND id IN ($placeholders)
                        AND senderId != ? 
                        AND is_read = 0";
        $selectStmt = $qb->pdo->prepare($selectSql);

        // build params: chatId, ids..., userId
        $params = array_merge([$chatId], $cleanIds, [$userId]);
        $selectStmt->execute($params);
        $rows = $selectStmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($rows)) {
            echo json_encode(['success' => true, 'updated' => []]);
            exit();
        }

        $toUpdate = array_map(function($r){ return (int)$r['id']; }, $rows);
        $placeholders2 = implode(',', array_fill(0, count($toUpdate), '?'));

        // Update those messages: set is_read = 1 and optional read_at timestamp
        $updateSql = "UPDATE messages 
                      SET is_read = 1, read_at = NOW() 
                      WHERE chatId = ? 
                        AND id IN ($placeholders2)
                        AND senderId != ? 
                        AND is_read = 0";
        $updateStmt = $qb->pdo->prepare($updateSql);
        $updateParams = array_merge([$chatId], $toUpdate, [$userId]);
        $updateStmt->execute($updateParams);

        echo json_encode(['success' => true, 'updated' => $toUpdate, 'count' => $updateStmt->rowCount()]);
        exit();

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error', 'detail' => $e->getMessage()]);
        exit();
    }
 }
}
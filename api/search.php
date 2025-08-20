<?php
require_once '../Core/bootstrap.php';

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
?>
<?php
require_once '../Core/bootstrap.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit();
}

try {
    $queryBuilder = new queryBuilder();
    $user_id = $_SESSION['user_id'];
    
    $notifications = $queryBuilder->getUnreadNotificationsCount($user_id);
    $messages = $queryBuilder->getUnreadMessagesCount($user_id);
    
    echo json_encode([
        'notifications' => $notifications,
        'messages' => $messages
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
exit();
?>
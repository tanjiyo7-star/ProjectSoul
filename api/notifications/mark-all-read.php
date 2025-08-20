<?php
require_once '../../Core/bootstrap.php';

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
?>
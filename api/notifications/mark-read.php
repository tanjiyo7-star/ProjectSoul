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
    $input = json_decode(file_get_contents('php://input'), true);
    $notificationId = intval($input['notification_id'] ?? 0);
    
    if ($notificationId <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid notification ID']);
        exit();
    }
    
    $queryBuilder = new queryBuilder();
    $userId = $_SESSION['user_id'];
    
    $sql = "UPDATE notifications SET status = 'read' WHERE id = :id AND toUserId = :userId";
    $stmt = $queryBuilder->pdo->prepare($sql);
    $result = $stmt->execute(['id' => $notificationId, 'userId' => $userId]);
    
    if ($result && $stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Notification marked as read']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Notification not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
exit();
?>
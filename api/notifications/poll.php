<?php
require_once '../../Core/bootstrap.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit();
}

try {
    $queryBuilder = new queryBuilder();
    $userId = $_SESSION['user_id'];
    
    // Get notifications from the last 30 seconds
    $sql = "SELECT n.*, u.firstName, u.lastName, pr.avatar
            FROM notifications n
            JOIN users u ON n.fromUserId = u.id
            LEFT JOIN profiles pr ON u.id = pr.id
            WHERE n.toUserId = :userId
            AND n.created_at > DATE_SUB(NOW(), INTERVAL 30 SECOND)
            ORDER BY n.created_at DESC";
    
    $stmt = $queryBuilder->pdo->prepare($sql);
    $stmt->execute(['userId' => $userId]);
    $newNotifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['newNotifications' => $newNotifications]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
exit();
?>
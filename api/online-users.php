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
    
    // Get users who were active in the last 5 minutes
    $sql = "SELECT id FROM users 
            WHERE last_seen > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
            AND id != :userId";
    
    $stmt = $queryBuilder->pdo->prepare($sql);
    $stmt->execute(['userId' => $_SESSION['user_id']]);
    
    $onlineUsers = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $onlineUsers[] = intval($row['id']);
    }
    
    echo json_encode(['onlineUsers' => $onlineUsers]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
exit();
?>
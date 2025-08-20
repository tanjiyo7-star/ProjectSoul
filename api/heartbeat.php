<?php
require_once '../Core/bootstrap.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit();
}

try {
    // Update user's last_seen timestamp
    $queryBuilder = new queryBuilder();
    $sql = "UPDATE users SET last_seen = NOW() WHERE id = :userId";
    $stmt = $queryBuilder->pdo->prepare($sql);
    $stmt->execute(['userId' => $_SESSION['user_id']]);
    
    echo json_encode(['status' => 'ok', 'timestamp' => time()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
exit();
?>
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
?>
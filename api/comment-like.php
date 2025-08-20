<?php
require_once '../Core/bootstrap.php';

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
    
    $queryBuilder = new queryBuilder();
    $userId = $_SESSION['user_id'];
    
    if ($action === 'like') {
        // Check if already liked
        $sql = "SELECT id FROM comment_likes WHERE userId = :userId AND commentId = :commentId";
        $stmt = $queryBuilder->pdo->prepare($sql);
        $stmt->execute(['userId' => $userId, 'commentId' => $commentId]);
        
        if (!$stmt->fetch()) {
            $sql = "INSERT INTO comment_likes (userId, commentId) VALUES (:userId, :commentId)";
            $stmt = $queryBuilder->pdo->prepare($sql);
            $result = $stmt->execute(['userId' => $userId, 'commentId' => $commentId]);
        } else {
            $result = true; // Already liked
        }
    } else {
        $sql = "DELETE FROM comment_likes WHERE userId = :userId AND commentId = :commentId";
        $stmt = $queryBuilder->pdo->prepare($sql);
        $result = $stmt->execute(['userId' => $userId, 'commentId' => $commentId]);
    }
    
    echo json_encode(['success' => $result]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
exit();
?>
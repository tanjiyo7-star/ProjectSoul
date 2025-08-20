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
    $since = isset($_GET['since']) ? intval($_GET['since']) : 0;
    
    // Convert timestamp to MySQL datetime
    $sinceDate = date('Y-m-d H:i:s', $since / 1000);
    
    $sql = "SELECT COUNT(*) AS new_count
            FROM posts p
            WHERE p.created_at > :since
            AND p.userId != :userId";
    
    $stmt = $queryBuilder->pdo->prepare($sql);
    $stmt->execute([
        'since' => $sinceDate,
        'userId' => $_SESSION['user_id']
    ]);
    
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $newPosts = $result ? $result['new_count'] : 0;
    
    echo json_encode(['newPosts' => $newPosts]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
exit();
?>
<?php
require_once '../../Core/bootstrap.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit();
}

try {
    // Extract post ID from URL path
    $uri = $_SERVER['REQUEST_URI'];
    $matches = [];
    if (preg_match('#/api/comments/(\d+)/poll#', $uri, $matches)) {
        $postId = intval($matches[1]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Missing post ID']);
        exit();
    }
    
    $queryBuilder = new queryBuilder();
    
    // Get recent comments (last 30 seconds)
    $sql = "SELECT 
                c.id,
                c.content,
                c.created_at,
                c.userId,
                u.firstName,
                u.lastName,
                pr.avatar
            FROM comments c
            JOIN users u ON c.userId = u.id
            LEFT JOIN profiles pr ON u.id = pr.id
            WHERE c.postId = :postId
            AND c.created_at > DATE_SUB(NOW(), INTERVAL 30 SECOND)
            ORDER BY c.created_at DESC";
    
    $stmt = $queryBuilder->pdo->prepare($sql);
    $stmt->execute(['postId' => $postId]);
    $newComments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format comments for frontend
    $formattedComments = [];
    foreach ($newComments as $comment) {
        $formattedComments[] = [
            'id' => $comment['id'],
            'content' => $comment['content'],
            'userId' => $comment['userId'],
            'username' => $comment['firstName'] . ' ' . $comment['lastName'],
            'avatar' => $comment['avatar'],
            'created_at' => $comment['created_at']
        ];
    }
    
    echo json_encode(['newComments' => $formattedComments]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
exit();
?>
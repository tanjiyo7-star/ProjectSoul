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
    if (preg_match('#/api/comments/(\d+)$#', $uri, $matches)) {
        $postId = intval($matches[1]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Missing post ID']);
        exit();
    }
    
    $queryBuilder = new queryBuilder();
    $comments = $queryBuilder->getCommentsForPost($postId);
    
    // Format comments for frontend
    $formattedComments = [];
    foreach ($comments as $comment) {
        $formattedComments[] = [
            'id' => $comment['id'],
            'content' => $comment['content'],
            'userId' => $comment['userId'],
            'username' => $comment['firstName'] . ' ' . $comment['lastName'],
            'avatar' => $comment['avatar'],
            'created_at' => $comment['created_at']
        ];
    }
    
    echo json_encode(['comments' => $formattedComments]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
exit();
?>
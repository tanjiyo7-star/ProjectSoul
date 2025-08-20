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
    $postIds = $input['post_ids'] ?? [];
    
    if (empty($postIds) || !is_array($postIds)) {
        echo json_encode(['commentCounts' => []]);
        exit();
    }
    
    $queryBuilder = new queryBuilder();
    $commentCounts = [];
    
    foreach ($postIds as $postId) {
        $postId = intval($postId);
        if ($postId > 0) {
            $commentCounts[$postId] = $queryBuilder->getCommentsCountForPost($postId);
        }
    }
    
    echo json_encode(['commentCounts' => $commentCounts]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
exit();
?>
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
    
    if ($commentId <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid comment ID']);
        exit();
    }
    
    $queryBuilder = new queryBuilder();
    
    // Verify the comment belongs to the current user
    $sql = "SELECT userId FROM comments WHERE id = :commentId";
    $stmt = $queryBuilder->pdo->prepare($sql);
    $stmt->execute(['commentId' => $commentId]);
    $comment = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$comment) {
        http_response_code(404);
        echo json_encode(['error' => 'Comment not found']);
        exit();
    }
    
    if ($comment['userId'] != $_SESSION['user_id']) {
        http_response_code(403);
        echo json_encode(['error' => 'Not authorized to delete this comment']);
        exit();
    }
    
    // Delete the comment
    $result = $queryBuilder->deleteComment($commentId);
    
    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Comment deleted successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete comment']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
exit();
?>
<?php
require_once '../../Core/bootstrap.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit();
}

try {
    // Get chat ID from URL (e.g. /api/messages/49/latest)
    $uri = $_SERVER['REQUEST_URI'];
    $matches = [];
    if (preg_match('#/api/messages/(\d+)/latest#', $uri, $matches)) {
        $chatId = intval($matches[1]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Missing chat ID']);
        exit();
    }
    
    $queryBuilder = new queryBuilder();
    $userId = $_SESSION['user_id'];
    
    // Verify user has access to this chat
    $chats = $queryBuilder->getChatsForUser($userId);
    $hasAccess = false;
    foreach ($chats as $chat) {
        if ($chat['chat_id'] == $chatId) {
            $hasAccess = true;
            break;
        }
    }
    
    if (!$hasAccess) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        exit();
    }
    
    // Get latest messages (last 30 seconds)
    $sql = "SELECT m.*, u.firstName, u.lastName, pr.avatar
            FROM messages m
            JOIN users u ON m.senderId = u.id
            LEFT JOIN profiles pr ON u.id = pr.id
            WHERE m.chatId = :chatId
            AND m.created_at > DATE_SUB(NOW(), INTERVAL 30 SECOND)
            ORDER BY m.created_at ASC";
    
    $stmt = $queryBuilder->pdo->prepare($sql);
    $stmt->execute(['chatId' => $chatId]);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['messages' => $messages]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
exit();
?>
$uri = $_SERVER['REQUEST_URI'];
$matches = [];
if (preg_match('#/api/messages/(\d+)/latest#', $uri, $matches)) {
    $chatId = intval($matches[1]);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Missing chat ID']);
    exit;
}

// TODO: Fetch latest messages for $chatId from your database
// Example:
$messages = []; // Replace with actual fetch logic

echo json_encode(['messages' => $messages]);
exit;
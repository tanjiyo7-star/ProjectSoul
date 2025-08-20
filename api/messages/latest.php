<?php
header('Content-Type: application/json');

// Get chat ID from URL (e.g. /api/messages/49/latest)
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
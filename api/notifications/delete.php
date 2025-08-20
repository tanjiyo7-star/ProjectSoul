<?php
header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['notification_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing notification_id']);
    exit;
}

// TODO: Add your notification deletion logic here.
// Example: $deleted = NotificationModel::deleteById($data['notification_id']);

echo json_encode(['success' => true]);
exit;
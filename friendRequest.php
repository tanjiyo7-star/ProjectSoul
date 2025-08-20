<?php
session_start();
require 'connection.php';

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';
    $user_id = intval($data['user_id'] ?? 0);
    $allowed_actions = ['send', 'accept', 'decline', 'cancel', 'unfriend'];

    if (!isset($_SERVER['HTTP_X_CSRF_TOKEN']) || !hash_equals($_SESSION['csrf_token'] ?? '', $_SERVER['HTTP_X_CSRF_TOKEN'])) {
        throw new Exception('Invalid CSRF token.');
    }

    if (!in_array($action, $allowed_actions) || $user_id <= 0 || $user_id === $_SESSION['user_id']) {
        throw new Exception('Invalid request parameters.');
    }

    $current_user_id = $_SESSION['user_id'];
    $conn->begin_transaction();

    switch ($action) {
        case 'send':
            $stmt = $conn->prepare("SELECT * FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)");
            $stmt->bind_param("iiii", $current_user_id, $user_id, $user_id, $current_user_id);
            $stmt->execute();
            if ($stmt->get_result()->num_rows > 0) {
                throw new Exception('Friend request already exists.');
            }

            $stmt = $conn->prepare("INSERT INTO friends (user_id, friend_id, action_user_id, status) VALUES (?, ?, ?, 'pending')");
            $stmt->bind_param("iii", $current_user_id, $user_id, $current_user_id);
            $stmt->execute();

            $message = "sent you a friend request.";
            $stmt = $conn->prepare("INSERT INTO notifications (from_user_id, to_user_id, post_id, message, status, created_at) VALUES (?, ?, NULL, ?, 'unread', NOW())");
            $stmt->bind_param("iis", $current_user_id, $user_id, $message);
            $stmt->execute();

            echo json_encode(['success' => true, 'message' => 'Friend request sent.']);
            break;

        case 'accept':
            $stmt = $conn->prepare("UPDATE friends SET status = 'accepted', action_user_id = ? WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)) AND status = 'pending'");
            $stmt->bind_param("iiiii", $current_user_id, $user_id, $current_user_id, $current_user_id, $user_id);
            $stmt->execute();

            if ($stmt->affected_rows === 0) {
                throw new Exception('No pending request to accept.');
            }

            $message = "accepted your friend request.";
            $stmt = $conn->prepare("INSERT INTO notifications (from_user_id, to_user_id, post_id, message, status, created_at) VALUES (?, ?, NULL, ?, 'unread', NOW())");
            $stmt->bind_param("iis", $current_user_id, $user_id, $message);
            $stmt->execute();

            echo json_encode(['success' => true, 'message' => 'Friend request accepted.']);
            break;

        case 'decline':
            $stmt = $conn->prepare("DELETE FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)");
            $stmt->bind_param("iiii", $user_id, $current_user_id, $current_user_id, $user_id);
            $stmt->execute();

            echo json_encode(['success' => true, 'message' => 'Friend request declined.']);
            break;

        case 'cancel':
            $stmt = $conn->prepare("DELETE FROM friends WHERE user_id = ? AND friend_id = ? AND status = 'pending' AND action_user_id = ?");
            $stmt->bind_param("iii", $current_user_id, $user_id, $current_user_id);
            $stmt->execute();

            if ($stmt->affected_rows === 0) {
                throw new Exception('No pending request to cancel.');
            }

            $stmt = $conn->prepare("DELETE FROM notifications WHERE from_user_id = ? AND to_user_id = ? AND message = 'sent you a friend request.' AND status = 'unread'");
            $stmt->bind_param("ii", $current_user_id, $user_id);
            $stmt->execute();

            echo json_encode(['success' => true, 'message' => 'Friend request canceled.']);
            break;

        case 'unfriend':
            $stmt = $conn->prepare("DELETE FROM friends WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)) AND status = 'accepted'");
            $stmt->bind_param("iiii", $current_user_id, $user_id, $user_id, $current_user_id);
            $stmt->execute();

            if ($stmt->affected_rows === 0) {
                throw new Exception('Friendship not found.');
            }

            $message = "unfriended you";
            $stmt = $conn->prepare("INSERT INTO notifications (from_user_id, to_user_id, message, status, created_at) VALUES (?, ?, ?, 'unread', NOW())");
            $stmt->bind_param("iis", $current_user_id, $user_id, $message);
            $stmt->execute();

            echo json_encode(['success' => true, 'message' => 'Friend removed.']);
            break;

        default:
            throw new Exception('Invalid action.');
    }

    $conn->commit();
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>

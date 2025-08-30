<?php
require_once 'vendor/autoload.php';
require_once 'Core/Database/dbConnection.php';
require_once 'Core/Database/queryBuilder.php';

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Ratchet\App;
use Ratchet\RFC6455\Messaging\MessageInterface;

/**
 * SoulBridge WebSocket Server
 * Handles real-time communication for messages, notifications, and user status
 */
class SoulBridgeWebSocket implements MessageComponentInterface {
    protected $clients;
    protected $userConnections;
    protected $queryBuilder;
    protected $rooms;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
        $this->userConnections = [];
        $this->rooms = [];
        $this->queryBuilder = new queryBuilder();
        
        echo "SoulBridge WebSocket Server initialized\n";
    }

    public function onOpen(ConnectionInterface $conn) {
        // Parse session from query parameters
        $query = [];
        parse_str($conn->httpRequest->getUri()->getQuery(), $query);
        
        $sessionId = $query['session_id'] ?? null;
        $userId = $this->validateSession($sessionId);
        
        if (!$userId) {
            echo "Invalid session, closing connection\n";
            $conn->close();
            return;
        }

        // Store connection with user info
        $this->clients->attach($conn);
        $this->userConnections[$userId] = $conn;
        $conn->userId = $userId;
        $conn->sessionId = $sessionId;

        // Update user online status
        $this->updateUserOnlineStatus($userId, true);
        
        // Join user to their personal room
        $this->joinRoom($conn, "user_$userId");
        
        // Send initial data
        $this->sendToConnection($conn, [
            'type' => 'connected',
            'message' => 'Connected to SoulBridge',
            'userId' => $userId,
            'timestamp' => time()
        ]);

        // Broadcast user online status to friends
        $this->broadcastUserStatus($userId, 'online');
        
        echo "User $userId connected\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        try {
            $data = json_decode($msg, true);
            
            if (!$data || !isset($data['type'])) {
                return;
            }

            switch ($data['type']) {
                case 'send_message':
                    $this->handleSendMessage($from, $data);
                    break;
                    
                case 'typing_start':
                    $this->handleTypingStart($from, $data);
                    break;
                    
                case 'typing_stop':
                    $this->handleTypingStop($from, $data);
                    break;
                    
                case 'mark_read':
                    $this->handleMarkRead($from, $data);
                    break;
                    
                case 'join_chat':
                    $this->handleJoinChat($from, $data);
                    break;
                    
                case 'leave_chat':
                    $this->handleLeaveChat($from, $data);
                    break;
                    
                case 'heartbeat':
                    $this->handleHeartbeat($from);
                    break;
                    
                default:
                    echo "Unknown message type: {$data['type']}\n";
            }
        } catch (Exception $e) {
            echo "Error handling message: " . $e->getMessage() . "\n";
        }
    }

    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
        
        if (isset($conn->userId)) {
            $userId = $conn->userId;
            unset($this->userConnections[$userId]);
            
            // Update user offline status
            $this->updateUserOnlineStatus($userId, false);
            
            // Broadcast user offline status to friends
            $this->broadcastUserStatus($userId, 'offline');
            
            echo "User $userId disconnected\n";
        }
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "WebSocket error: " . $e->getMessage() . "\n";
        $conn->close();
    }

    /**
     * Validate session and return user ID
     */
    private function validateSession($sessionId) {
        if (!$sessionId) return false;
        
        // Start session with provided ID
        session_id($sessionId);
        session_start();
        
        return $_SESSION['user_id'] ?? false;
    }

    /**
     * Handle sending messages
     */
    private function handleSendMessage($from, $data) {
        $chatId = $data['chatId'] ?? null;
        $message = $data['message'] ?? '';
        $messageType = $data['messageType'] ?? 'text';
        $mediaUrl = $data['mediaUrl'] ?? null;
        
        if (!$chatId || !$message) return;
        
        // Save message to database
        $messageId = $this->saveMessage($from->userId, $chatId, $message, $messageType, $mediaUrl);
        
        if ($messageId) {
            // Get chat participants
            $participants = $this->getChatParticipants($chatId);
            
            // Prepare message data
            $messageData = [
                'type' => 'new_message',
                'messageId' => $messageId,
                'chatId' => $chatId,
                'senderId' => $from->userId,
                'message' => $message,
                'messageType' => $messageType,
                'mediaUrl' => $mediaUrl,
                'timestamp' => time(),
                'senderName' => $this->getUserName($from->userId),
                'senderAvatar' => $this->getUserAvatar($from->userId)
            ];
            
            // Send to all chat participants
            foreach ($participants as $participantId) {
                if (isset($this->userConnections[$participantId])) {
                    $this->sendToConnection($this->userConnections[$participantId], $messageData);
                }
            }
        }
    }

    /**
     * Handle typing indicators
     */
    private function handleTypingStart($from, $data) {
        $chatId = $data['chatId'] ?? null;
        if (!$chatId) return;
        
        $participants = $this->getChatParticipants($chatId);
        $typingData = [
            'type' => 'typing_start',
            'chatId' => $chatId,
            'userId' => $from->userId,
            'userName' => $this->getUserName($from->userId)
        ];
        
        foreach ($participants as $participantId) {
            if ($participantId != $from->userId && isset($this->userConnections[$participantId])) {
                $this->sendToConnection($this->userConnections[$participantId], $typingData);
            }
        }
    }

    private function handleTypingStop($from, $data) {
        $chatId = $data['chatId'] ?? null;
        if (!$chatId) return;
        
        $participants = $this->getChatParticipants($chatId);
        $typingData = [
            'type' => 'typing_stop',
            'chatId' => $chatId,
            'userId' => $from->userId
        ];
        
        foreach ($participants as $participantId) {
            if ($participantId != $from->userId && isset($this->userConnections[$participantId])) {
                $this->sendToConnection($this->userConnections[$participantId], $typingData);
            }
        }
    }

    /**
     * Handle mark messages as read
     */
    private function handleMarkRead($from, $data) {
        $chatId = $data['chatId'] ?? null;
        $messageIds = $data['messageIds'] ?? [];
        
        if (!$chatId || empty($messageIds)) return;
        
        // Mark messages as read in database
        $this->queryBuilder->markMessagesAsRead($chatId, $from->userId);
        
        // Notify sender about read status
        $participants = $this->getChatParticipants($chatId);
        foreach ($participants as $participantId) {
            if ($participantId != $from->userId && isset($this->userConnections[$participantId])) {
                $this->sendToConnection($this->userConnections[$participantId], [
                    'type' => 'messages_read',
                    'chatId' => $chatId,
                    'readBy' => $from->userId,
                    'messageIds' => $messageIds
                ]);
            }
        }
    }

    /**
     * Handle joining chat room
     */
    private function handleJoinChat($from, $data) {
        $chatId = $data['chatId'] ?? null;
        if (!$chatId) return;
        
        $this->joinRoom($from, "chat_$chatId");
        
        // Mark messages as read when joining
        $this->queryBuilder->markMessagesAsRead($chatId, $from->userId);
    }

    /**
     * Handle leaving chat room
     */
    private function handleLeaveChat($from, $data) {
        $chatId = $data['chatId'] ?? null;
        if (!$chatId) return;
        
        $this->leaveRoom($from, "chat_$chatId");
    }

    /**
     * Handle heartbeat
     */
    private function handleHeartbeat($from) {
        $this->updateUserOnlineStatus($from->userId, true);
        
        $this->sendToConnection($from, [
            'type' => 'heartbeat_response',
            'timestamp' => time()
        ]);
    }

    /**
     * Broadcast notifications
     */
    public function broadcastNotification($userId, $notification) {
        if (isset($this->userConnections[$userId])) {
            $this->sendToConnection($this->userConnections[$userId], [
                'type' => 'new_notification',
                'notification' => $notification,
                'timestamp' => time()
            ]);
        }
    }

    /**
     * Broadcast friend request
     */
    public function broadcastFriendRequest($userId, $request) {
        if (isset($this->userConnections[$userId])) {
            $this->sendToConnection($this->userConnections[$userId], [
                'type' => 'friend_request',
                'request' => $request,
                'timestamp' => time()
            ]);
        }
    }

    /**
     * Broadcast new post
     */
    public function broadcastNewPost($userIds, $post) {
        foreach ($userIds as $userId) {
            if (isset($this->userConnections[$userId])) {
                $this->sendToConnection($this->userConnections[$userId], [
                    'type' => 'new_post',
                    'post' => $post,
                    'timestamp' => time()
                ]);
            }
        }
    }

    /**
     * Helper methods
     */
    private function joinRoom($conn, $room) {
        if (!isset($this->rooms[$room])) {
            $this->rooms[$room] = new \SplObjectStorage;
        }
        $this->rooms[$room]->attach($conn);
    }

    private function leaveRoom($conn, $room) {
        if (isset($this->rooms[$room])) {
            $this->rooms[$room]->detach($conn);
        }
    }

    private function sendToRoom($room, $data) {
        if (isset($this->rooms[$room])) {
            foreach ($this->rooms[$room] as $conn) {
                $this->sendToConnection($conn, $data);
            }
        }
    }

    private function sendToConnection($conn, $data) {
        try {
            $conn->send(json_encode($data));
        } catch (Exception $e) {
            echo "Error sending to connection: " . $e->getMessage() . "\n";
        }
    }

    private function saveMessage($userId, $chatId, $message, $messageType = 'text', $mediaUrl = null) {
        try {
            $stmt = $this->queryBuilder->pdo->prepare(
                "INSERT INTO messages (chatId, senderId, content, message_type, media_url, created_at) 
                 VALUES (?, ?, ?, ?, ?, NOW())"
            );
            $stmt->execute([$chatId, $userId, $message, $messageType, $mediaUrl]);
            return $this->queryBuilder->pdo->lastInsertId();
        } catch (Exception $e) {
            echo "Error saving message: " . $e->getMessage() . "\n";
            return false;
        }
    }

    private function getChatParticipants($chatId) {
        try {
            $stmt = $this->queryBuilder->pdo->prepare("SELECT userId FROM chat_participants WHERE chatId = ?");
            $stmt->execute([$chatId]);
            return $stmt->fetchAll(PDO::FETCH_COLUMN);
        } catch (Exception $e) {
            echo "Error getting chat participants: " . $e->getMessage() . "\n";
            return [];
        }
    }

    private function getUserName($userId) {
        try {
            $stmt = $this->queryBuilder->pdo->prepare("SELECT CONCAT(firstName, ' ', lastName) as name FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ? $result['name'] : 'Unknown User';
        } catch (Exception $e) {
            return 'Unknown User';
        }
    }

    private function getUserAvatar($userId) {
        try {
            $stmt = $this->queryBuilder->pdo->prepare("SELECT avatar FROM profiles WHERE id = ?");
            $stmt->execute([$userId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ? ($result['avatar'] ?? 'images/profile.jpg') : 'images/profile.jpg';
        } catch (Exception $e) {
            return 'images/profile.jpg';
        }
    }

    private function updateUserOnlineStatus($userId, $isOnline) {
        try {
            $status = $isOnline ? 'NOW()' : 'NULL';
            $stmt = $this->queryBuilder->pdo->prepare("UPDATE users SET last_seen = $status WHERE id = ?");
            $stmt->execute([$userId]);
        } catch (Exception $e) {
            echo "Error updating user status: " . $e->getMessage() . "\n";
        }
    }

    private function broadcastUserStatus($userId, $status) {
        // Get user's friends
        $friends = $this->getUserFriends($userId);
        
        foreach ($friends as $friendId) {
            if (isset($this->userConnections[$friendId])) {
                $this->sendToConnection($this->userConnections[$friendId], [
                    'type' => 'user_status',
                    'userId' => $userId,
                    'status' => $status,
                    'timestamp' => time()
                ]);
            }
        }
    }

    private function getUserFriends($userId) {
        try {
            $stmt = $this->queryBuilder->pdo->prepare(
                "SELECT CASE WHEN userId = ? THEN friendId ELSE userId END as friend_id 
                 FROM friends 
                 WHERE (userId = ? OR friendId = ?) AND status = 'accepted'"
            );
            $stmt->execute([$userId, $userId, $userId]);
            return $stmt->fetchAll(PDO::FETCH_COLUMN);
        } catch (Exception $e) {
            echo "Error getting user friends: " . $e->getMessage() . "\n";
            return [];
        }
    }

    /**
     * Get online users
     */
    public function getOnlineUsers() {
        return array_keys($this->userConnections);
    }

    /**
     * Send notification to specific user
     */
    public function sendNotificationToUser($userId, $notification) {
        if (isset($this->userConnections[$userId])) {
            $this->sendToConnection($this->userConnections[$userId], [
                'type' => 'notification',
                'data' => $notification,
                'timestamp' => time()
            ]);
        }
    }

    /**
     * Broadcast to all connected users
     */
    public function broadcastToAll($data) {
        foreach ($this->clients as $client) {
            $this->sendToConnection($client, $data);
        }
    }
}

// Create and run the WebSocket server
$app = new App('localhost', 8080);
$soulBridgeWS = new SoulBridgeWebSocket();

$app->route('/websocket', $soulBridgeWS, ['*']);

echo "Starting SoulBridge WebSocket Server on localhost:8080\n";
echo "Press Ctrl+C to stop the server\n";

$app->run();
?>
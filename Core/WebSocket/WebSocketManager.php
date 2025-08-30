<?php

/**
 * WebSocket Manager
 * Handles WebSocket server integration with the main application
 */
class WebSocketManager {
    private static $instance = null;
    private $serverUrl;
    private $isEnabled;
    
    private function __construct() {
        $this->serverUrl = 'ws://localhost:8080/websocket';
        $this->isEnabled = $this->checkServerAvailability();
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Check if WebSocket server is available
     */
    private function checkServerAvailability() {
        // For production, you might want to ping the server
        // For now, assume it's available if in development
        return true;
    }
    
    /**
     * Get WebSocket connection URL with session
     */
    public function getConnectionUrl() {
        $sessionId = session_id();
        return $this->serverUrl . '?session_id=' . $sessionId;
    }
    
    /**
     * Check if WebSocket is enabled
     */
    public function isEnabled() {
        return $this->isEnabled;
    }
    
    /**
     * Broadcast notification to user
     */
    public function broadcastNotification($userId, $notification) {
        // This would typically use a queue system in production
        // For now, we'll store it for the WebSocket server to pick up
        $this->storeRealTimeEvent('notification', $userId, $notification);
    }
    
    /**
     * Broadcast friend request
     */
    public function broadcastFriendRequest($userId, $request) {
        $this->storeRealTimeEvent('friend_request', $userId, $request);
    }
    
    /**
     * Broadcast new post
     */
    public function broadcastNewPost($userIds, $post) {
        foreach ($userIds as $userId) {
            $this->storeRealTimeEvent('new_post', $userId, $post);
        }
    }
    
    /**
     * Store real-time event (for WebSocket server to process)
     */
    private function storeRealTimeEvent($type, $userId, $data) {
        // In production, you'd use Redis or a message queue
        // For development, we'll use a simple file-based approach
        $event = [
            'type' => $type,
            'userId' => $userId,
            'data' => $data,
            'timestamp' => time()
        ];
        
        $eventsFile = 'temp/websocket_events.json';
        $events = [];
        
        if (file_exists($eventsFile)) {
            $events = json_decode(file_get_contents($eventsFile), true) ?: [];
        }
        
        $events[] = $event;
        
        // Keep only last 100 events
        $events = array_slice($events, -100);
        
        // Ensure temp directory exists
        if (!is_dir('temp')) {
            mkdir('temp', 0755, true);
        }
        
        file_put_contents($eventsFile, json_encode($events));
    }
    
    /**
     * Get configuration for frontend
     */
    public function getClientConfig() {
        return [
            'enabled' => $this->isEnabled,
            'url' => $this->getConnectionUrl(),
            'reconnectAttempts' => 5,
            'heartbeatInterval' => 30000
        ];
    }
}
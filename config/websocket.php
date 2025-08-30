<?php
/**
 * WebSocket Configuration
 * Handles different environments (localhost vs shared hosting)
 */

class WebSocketConfig {
    private static $config = null;
    
    public static function getConfig() {
        if (self::$config === null) {
            self::$config = self::loadConfig();
        }
        return self::$config;
    }
    
    private static function loadConfig() {
        // Detect environment
        $isLocalhost = in_array($_SERVER['HTTP_HOST'] ?? '', ['localhost', '127.0.0.1', 'localhost:8000']);
        $isSharedHosting = !$isLocalhost && (strpos($_SERVER['HTTP_HOST'] ?? '', '.infinityfreeapp.com') !== false);
        
        if ($isLocalhost) {
            return [
                'enabled' => true,
                'host' => 'localhost',
                'port' => 8080,
                'secure' => false,
                'url' => 'ws://localhost:8080/websocket'
            ];
        } elseif ($isSharedHosting) {
            // InfinityFree doesn't support WebSocket, fallback to polling
            return [
                'enabled' => false,
                'fallback' => 'polling',
                'polling_interval' => 5000
            ];
        } else {
            // Production server with WebSocket support
            return [
                'enabled' => true,
                'host' => $_SERVER['HTTP_HOST'],
                'port' => 443,
                'secure' => true,
                'url' => 'wss://' . $_SERVER['HTTP_HOST'] . '/websocket'
            ];
        }
    }
    
    public static function isWebSocketEnabled() {
        $config = self::getConfig();
        return $config['enabled'] ?? false;
    }
    
    public static function getClientConfig() {
        $config = self::getConfig();
        
        return [
            'enabled' => $config['enabled'] ?? false,
            'url' => $config['url'] ?? null,
            'fallback' => $config['fallback'] ?? null,
            'polling_interval' => $config['polling_interval'] ?? 10000,
            'reconnect_attempts' => 5,
            'heartbeat_interval' => 30000
        ];
    }
}
?>
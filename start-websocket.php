<?php
/**
 * WebSocket Server Starter Script
 * Use this to start the WebSocket server for development
 */

echo "Starting SoulBridge WebSocket Server...\n";
echo "Make sure you have run 'composer install' first.\n\n";

// Check if composer dependencies are installed
if (!file_exists('vendor/autoload.php')) {
    echo "ERROR: Composer dependencies not found!\n";
    echo "Please run: composer install\n";
    exit(1);
}

// Check if required extensions are available
$requiredExtensions = ['pdo', 'pdo_mysql', 'json'];
foreach ($requiredExtensions as $ext) {
    if (!extension_loaded($ext)) {
        echo "ERROR: Required PHP extension '$ext' is not loaded!\n";
        exit(1);
    }
}

// Test database connection
try {
    require_once 'Core/Database/dbConnection.php';
    $testConnection = dbConnection::connect();
    echo "✓ Database connection successful\n";
} catch (Exception $e) {
    echo "ERROR: Database connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

echo "✓ All requirements met\n";
echo "✓ Starting WebSocket server on localhost:8080\n\n";

// Start the WebSocket server
require_once 'websocket-server.php';
?>
#!/bin/bash

echo "Starting SoulBridge WebSocket Server..."
echo

# Check if PHP is available
if ! command -v php &> /dev/null; then
    echo "ERROR: PHP is not installed or not in PATH!"
    exit 1
fi

# Check if composer dependencies exist
if [ ! -f "vendor/autoload.php" ]; then
    echo "Installing Composer dependencies..."
    composer install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies!"
        exit 1
    fi
fi

echo "Starting WebSocket server..."
php start-websocket.php
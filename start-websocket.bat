@echo off
echo Starting SoulBridge WebSocket Server...
echo.

REM Check if PHP is available
php --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: PHP is not found in PATH!
    echo Please make sure PHP is installed and added to your system PATH.
    pause
    exit /b 1
)

REM Check if composer dependencies exist
if not exist "vendor\autoload.php" (
    echo Installing Composer dependencies...
    composer install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
)

echo Starting WebSocket server...
php start-websocket.php

pause
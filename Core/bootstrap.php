<?php
 require_once 'vendor/autoload.php';
require_once 'Core/Security/SessionManager.php';
require_once 'Database/dbConnection.php';
require_once 'Database/queryBuilder.php';
require_once 'function.php';
require_once 'Router/web.php';
require_once 'Router/request.php';
require_once 'Router/router.php';
require_once 'Controller/PagesController.php';

SessionManager::start();

$queryBuilder = new queryBuilder();

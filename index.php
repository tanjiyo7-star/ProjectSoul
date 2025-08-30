<?php
 require_once 'vendor/autoload.php';
require_once 'Core/bootstrap.php';

    $request = new Request();
    $routes->handleRequest($request);
?>
 
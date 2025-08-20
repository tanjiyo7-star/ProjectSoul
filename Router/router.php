<?php   

    class Router {
        private $routes = [];

        public function __construct($routes) {
            $this->routes = $routes;
        }

        public function handleRequest($request) {
            $method = $request->getMethod();
            $uri = $request->getUri();
            $uri = strtok($uri, '?');

            $controllerAction = $this->routes[$method][$uri] ?? null;
            if ($controllerAction) {
                list($controller, $action) = explode('@', $controllerAction);
                $controller = new $controller();
                $controller->$action();
            } else {
                header("location: error");
            }
        }
    }
    $routes = new Router(require 'Router/web.php');
    


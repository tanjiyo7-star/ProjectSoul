<?php
return $routes = [
    'GET' => [
        '/' => 'PagesController@index',
        '/home' => 'PagesController@home',
        '/logout' => 'PagesController@logout',
        '/profile' => 'PagesController@profile',
        '/message' => 'PagesController@message',
        '/search' => 'PagesController@search',
        '/like' => 'PagesController@likePost',
        '/notification' => 'PagesController@notification',
        '/error' => 'PagesController@error',
        '/edit-profile' => 'PagesController@editProfile',
        '/comments' => 'PagesController@comments',
        '/api/notification-counts' => 'PagesController@apiNotificationCounts',
        '/api/new-posts-count' => 'PagesController@apiNewPostsCount',
        '/api/posts/like-counts' => 'PagesController@apiLikeCounts',
        '/api/posts/comment-counts' => 'PagesController@apiCommentCounts',
        '/comments' => 'PagesController@comment',
    ], 
    'POST' => [
        '/authenticate' => 'PagesController@authenticate',
        '/story-upload' => 'PagesController@storyUpload',
        '/post-create' => 'PagesController@postHandler',
        '/like' => 'PagesController@likePost',
        '/comment' => 'PagesController@commentHandler',
        '/sendMessage' =>'PagesController@sendMessage',
        '/friendRequest' => 'PagesController@friendRequest',
        '/story-upload' => 'PagesController@storyUpload',
        '/update-profile' => 'PagesController@updateProfile',
        '/upload-avatar' => 'PagesController@uploadAvatar',
        '/api/notifications/delete' => 'PagesController@deleteNotification',
        '/api/notifications/mark-read' => 'PagesController@markNotificationRead'
    ]
];
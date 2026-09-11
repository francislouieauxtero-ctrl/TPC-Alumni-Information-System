<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure CORS settings for your application. This
    | configuration is used by the HandleCors middleware to check incoming
    | cross-origin requests.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter(array_unique(array_merge(
        [
            'http://localhost:3000',           // Admin web app
            'http://localhost:5173',           // Vite dev server
            'http://10.0.2.2:5173',            // Android emulator to Vite dev
            'http://10.0.2.2:3000',            // Android emulator to port 3000
            'http://10.0.2.2:8000',            // Android emulator to backend
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:8000',
        ],
        explode(',', env('CORS_ALLOWED_ORIGINS', '')),
        [env('FRONTEND_URL')]
    )))),

    'allowed_origins_patterns' => array_values(array_filter(array_merge(
        [
            '#http://10\.0\.2\.2.*#',
            '#http://localhost.*#',
            '#http://127\.0\.0\.1.*#',
        ],
        explode(',', env('CORS_ALLOWED_ORIGINS_PATTERNS', ''))
    ))),

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Content-Type', 'Authorization'],

    'max_age' => 0,

    'supports_credentials' => true,
];

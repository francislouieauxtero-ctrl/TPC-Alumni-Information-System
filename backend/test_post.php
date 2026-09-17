<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Services\AnnouncementService;

try {
    $service = app(AnnouncementService::class);
    $user = User::where('role', 'super_admin')->first();
    $data = [
        'title' => 'Test',
        'content' => 'Test Content',
        'scope' => 'global'
    ];
    $announcement = $service->create($user, $data);
    echo "Created!\n";
} catch (\Throwable $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

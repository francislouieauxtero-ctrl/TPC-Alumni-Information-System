<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Mail;
use App\Models\Announcement;
use App\Mail\AnnouncementNotificationMail;

try {
    $announcement = Announcement::first();
    $recipients = ['francislouieauxtero@gmail.com', 'test@example.com'];
    Mail::bcc($recipients)->send(new AnnouncementNotificationMail($announcement, 'Test Admin'));
    echo "Sent successfully!\n";
} catch (\Throwable $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

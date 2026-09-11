<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return view('welcome');
});

Route::get('storage/{path}', function (string $path) {
    $disk = Storage::disk('public');
    $cleanPath = ltrim($path, '/');
    while (str_starts_with($cleanPath, 'storage/')) {
        $cleanPath = substr($cleanPath, 8);
    }

    if ($disk->exists($cleanPath)) {
        return response()->file($disk->path($cleanPath));
    }

    if (!str_contains($cleanPath, '/') && $disk->exists("avatars/{$cleanPath}")) {
        return response()->file($disk->path("avatars/{$cleanPath}"));
    }

    abort(404);
})->where('path', '.*');
